"use client";
import { supabase } from "@/utils/supabase/supabase";
import { Dispatch, SetStateAction, ReactElement, useState } from "react";
import getData from "./getData";

export default function AddTask(props: {
  taskList: Dispatch<SetStateAction<Array<ReactElement>>>;
}) {
  const [text, setText] = useState("");
  const [priority, setPriority] = useState("中");
  const [detail, setDetail] = useState("");

  const priorityToValue = (label: "高" | "中" | "低"): number => {
    switch (label) {
      case "高":
        return 3;
      case "中":
        return 2;
      case "低":
        return 1;
      default:
        return 2;
    }
  };

  const onSubmit = async (event: any) => {
    event.preventDefault();

    try {
      const priority_value = priorityToValue(priority);

      const { data, error } = await supabase
        .from("tasks")
        .insert([{ text, priority, priority_value, detail }])
        .select();

      if (error) {
        console.log("追加失敗", error);
      } else {
        console.log("追加成功", data);
      }

      await getData(props.taskList);
      setText("");
      setPriority("中");
    } catch (error) {
      console.log("その他エラー", error);
    }
  };

  return (
    <form className="mt-4" onSubmit={onSubmit}>
      <input
        type="text"
        className="w-full border border-gray-300 rounded-lg px-2 py-1"
        placeholder="新しいタスクを入力してください"
        required
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <textarea
        className="mt-2 w-full border border-gray-300 rounded-lg px-2 py-1 text-sm"
        placeholder="詳細を入力（任意）"
        value={detail}
        onChange={(e) => setDetail(e.target.value)}
      ></textarea>
      <select
        className="mt-2 w-full border border-gray-300 rounded-lg px-2 py-1 text-sm"
        value={priority}
        onChange={(e) => setPriority(e.target.value as "高" | "中" | "低")}
      >
        <option value="高">高</option>
        <option value="中">中</option>
        <option value="低">低</option>
      </select>
      <button
        type="submit"
        className="mt-2 w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg px-4 py-2"
      >
        追加
      </button>
    </form>
  );
}
