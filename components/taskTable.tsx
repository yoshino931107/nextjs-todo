"use client";
import AddTask from "./addTask";
import { ReactElement, useState, useEffect } from "react";
import getData from "./getData";

export default function TaskTable() {
  const [taskList, setTaskList] = useState<Array<ReactElement>>([]);

  const [filterStatus, setFilterStatus] = useState<
    "すべて" | "未着手" | "着手" | "完了" | "削除済み"
  >("すべて");

  const [sortPriority, setSortPriority] = useState<"昇順" | "降順" | "なし">(
    "なし"
  );

  useEffect(() => {
    getData(setTaskList, filterStatus, sortPriority);
  }, [filterStatus, sortPriority]);

  return (
    <div className="sm:w-full md:w-1/2 lg:w-1/2 xl:w-1/3 max-w-md mx-auto bg-white rounded-xl shadow-md">
      <div className="p-4">
        <h1 className="text-xl font-bold text-gray-800">Todoリスト</h1>
        <select
          className="border rounded px-2 py-1 text-sm mb-4"
          value={filterStatus}
          onChange={(e) =>
            setFilterStatus(e.target.value as typeof filterStatus)
          }
        >
          <option value="すべて">すべて</option>
          <option value="未着手">未着手</option>
          <option value="着手">着手</option>
          <option value="完了">完了</option>
          <option value="削除済み">削除済み</option>
        </select>
        <select
          value={sortPriority}
          onChange={(e) =>
            setSortPriority(e.target.value as "昇順" | "降順" | "なし")
          }
          className="border border-gray-300 rounded px-2 py-1 ml-2"
        >
          <option value="なし">ソートなし</option>
          <option value="昇順">優先度（低 → 高）</option>
          <option value="降順">優先度（高 → 低）</option>
        </select>
        <AddTask taskList={setTaskList}></AddTask>
        <ul className="mt-4 divide-y divide-gray-200">{taskList}</ul>
      </div>
    </div>
  );
}
