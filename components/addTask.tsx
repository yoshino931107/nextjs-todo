"use client";
import { supabase } from "@/utils/supabase/supabase";
import { Dispatch, SetStateAction, ReactElement, useState } from "react";
import getData from "./getData";

export default function AddTask(props: {
  taskList: Dispatch<SetStateAction<Array<ReactElement>>>;
}) {
  const [text, setText] = useState("");
  const [priority, setPriority] = useState("中");

  const onSubmit = async (event: any) => {
    event.preventDefault();

    try {
      const priorityValueMap = { 高: 3, 中: 2, 低: 1 };
      const priority_value = priorityValueMap[priority];
      console.log(priority, priority_value);

      const { data, error } = await supabase
        .from("tasks")
        .insert([{ text, priority, priority_value }])
        .select();

      if (error) {
        console.log("insertエラー", error);
      } else {
        console.log("insert成功", data);
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
        className="mt-2 w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg px-4 py-2"
      >
        追加
      </button>
    </form>
  );
}
