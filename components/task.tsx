"use client";
import { useState, Dispatch, SetStateAction, ReactElement } from "react";
import EditDialog from "./editDialog";
import RemoveDialog from "./removeDialog";
import RestoreDialog from "./restoreDialog";
import { supabase } from "../utils/supabase/supabase";

export default function Task(props: {
  id: number;
  text: string;
  update_at: string;
  status: "未着手" | "着手" | "完了";
  priority: "高" | "中" | "低";
  taskList: Dispatch<SetStateAction<Array<ReactElement>>>;
  filterStatus: string;
}) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [status, setStatus] = useState<"未着手" | "着手" | "完了">(
    props.status
  );
  const [priority, setPriority] = useState<"高" | "中" | "低">("中");
  const [selectedPriority, setSelectedPriority] = useState(priority);

  const id = props.id;
  const text = props.text;
  const update_at = props.update_at;
  let last_update = new Date(update_at);

  // ステータス変更処理
  const handleStatusChange = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const newStatus = e.target.value as typeof status;
    setStatus(newStatus);

    // Supabaseへ更新リクエスト
    const { error } = await supabase
      .from("tasks")
      .update({ status: newStatus })
      .eq("id", id);

    if (error) {
      alert("ステータス更新に失敗しました");
      console.error(error.message);
    }
  };

  const handlePriorityChange = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const newPriority = e.target.value as "高" | "中" | "低";
    setSelectedPriority(newPriority);

    const { error } = await supabase
      .from("tasks")
      .update({ priority: newPriority })
      .eq("id", id);

    if (error) {
      console.error("優先度の更新に失敗しました:", error);
    }

    // オプション：タスクリストを再取得したいならここで getData 呼ぶのもあり
    // await getData(taskList);
  };

  const priorityText =
    {
      1: "高",
      2: "中",
      3: "低",
    }[priority] ?? "未設定";

  return (
    <>
      <div>
        <p className="text-gray-600 break-all">{text}</p>
        <p className="text-xs text-gray-400">
          最終更新日時：{last_update.toLocaleString("ja-JP")}
        </p>
      </div>

      {/* ステータスのドロップダウン */}
      <select
        className="border rounded px-2 py-1 text-sm mr-2"
        value={status}
        onChange={handleStatusChange}
      >
        <option value="未着手">未着手</option>
        <option value="着手">着手</option>
        <option value="完了">完了</option>
      </select>

      {/* 優先度のドロップダウン */}
      <select
        value={selectedPriority}
        onChange={handlePriorityChange}
        className="mt-1 border border-gray-300 rounded px-2 py-1 text-sm"
      >
        <option value="高">高</option>
        <option value="中">中</option>
        <option value="低">低</option>
      </select>

      <div className="flex">
        <button
          type="button"
          className="w-9 text-blue-500 hover:text-blue-600"
          onClick={() => setShowEditModal(true)}
        >
          編集
        </button>
        {status === "削除済み" ? (
          <button
            type="button"
            className="ml-2 w-9 text-green-500 hover:text-green-600"
            onClick={() => setShowRestoreModal(true)}
          >
            復元
          </button>
        ) : (
          <button
            type="button"
            className="ml-2 w-9 text-red-500 hover:text-red-600"
            onClick={() => setShowRemoveModal(true)}
          >
            削除
          </button>
        )}
      </div>

      {showEditModal && (
        <EditDialog
          id={id}
          taskList={props.taskList}
          showModal={setShowEditModal}
        />
      )}
      {showRemoveModal && (
        <RemoveDialog
          id={id}
          taskList={props.taskList}
          showModal={setShowRemoveModal}
        />
      )}
      {showRestoreModal && (
        <RestoreDialog
          id={id}
          taskList={props.taskList}
          showModal={setShowRestoreModal}
          filterStatus={props.filterStatus}
        />
      )}
    </>
  );
}
