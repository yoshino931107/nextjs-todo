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

    const { data: tasks, error } = await query;

    if (error) {
      console.error(error);
      return;
    }

    if (tasks) {
      let filtered = tasks;

      if (filterStatus !== "すべて") {
        filtered = filtered.filter((task) => task.status === filterStatus);
      }

      if (sortPriority !== "なし") {
        filtered.sort((a, b) => {
          const aVal = a.priority_value ?? 0;
          const bVal = b.priority_value ?? 0;
          return sortPriority === "昇順" ? aVal - bVal : bVal - aVal;
        });
      }

      for (let task of filtered) {
        tmpTaskList.push(
          <li className="flex items-center justify-between py-2" key={task.id}>
            <Task
              taskList={setTaskList}
              id={task.id}
              text={task.text ?? ""}
              update_at={task.update_at ?? ""}
              status={task.status ?? "未着手"}
              priority={task.priority ?? "中"}
              detail={task.detail}
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
