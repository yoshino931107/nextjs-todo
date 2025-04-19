import { supabase } from "@/utils/supabase/supabase";
import Task from "./task";
import { Dispatch, SetStateAction, ReactElement } from "react";
import { TaskTable } from "./taskTable";

export default async function getData(
  setTaskList: Dispatch<SetStateAction<Array<ReactElement>>>,
  filterStatus: "すべて" | "未着手" | "着手" | "完了" | "削除済み",
  sortPriority: "昇順" | "降順" | "なし"
) {
  const tmpTaskList = [];

  try {
    let query;

    if (filterStatus === "すべて") {
      query = supabase
        .from("tasks")
        .select("*")
        .not("status", "in", '("削除済み","完了")');
    } else {
      query = supabase.from("tasks").select("*").eq("status", filterStatus);
    }

    if (filterStatus !== "すべて") {
      query.eq("status", filterStatus);
    }

    // 優先度で並び替え（高 → 中 → 低 になるように文字列の順番に注意）
    if (sortPriority === "昇順") {
      query.order("priority_value", { ascending: true });
    } else if (sortPriority === "降順") {
      query.order("priority_value", { ascending: false });
    }

    const { data: tasks, error } = await query;

    if (error) {
      console.error(error);
      return;
    }

    if (tasks) {
      for (let task of tasks) {
        tmpTaskList.push(
          <li className="flex items-center justify-between py-2" key={task.id}>
            <Task
              taskList={setTaskList}
              id={task.id}
              text={task.text ?? ""}
              update_at={task.update_at ?? ""}
              status={task.status ?? "未着手"}
            />
          </li>
        );
      }

      setTaskList(tmpTaskList);
    }
  } catch (err) {
    console.error("データ取得エラー:", err);
  }
}
