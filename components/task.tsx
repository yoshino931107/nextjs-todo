"use client";
import { useState, Dispatch, SetStateAction, ReactElement } from "react";
import EditDialog from "./editDialog";
import RemoveDialog from "./removeDialog";
import { supabase } from "../utils/supabase/supabase";

export default function Task(props: {
  id: number;
  text: string;
  update_at: string;
  status: "未着手" | "着手" | "完了";
  taskList: Dispatch<SetStateAction<Array<ReactElement>>>;
}) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [status, setStatus] = useState<"未着手" | "着手" | "完了">(
    props.status
  );

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
      .from("todos")
      .update({ status: newStatus })
      .eq("id", id);

    if (error) {
      alert("ステータス更新に失敗しました");
      console.error(error.message);
    }
  };

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
        onChange={async (e) => {
          const newStatus = e.target.value;

          // Supabaseにstatusを更新する
          const { error } = await supabase
            .from("todos")
            .update({ status: newStatus })
            .eq("id", id);

          if (error) {
            alert("ステータスの更新に失敗しました！");
          } else {
            // UIをリフレッシュする処理（再フェッチなど）をここで呼ぶと◎
            console.log("ステータスを更新しました！");
          }
        }}
      >
        <option value="未着手">未着手</option>
        <option value="着手">着手</option>
        <option value="完了">完了</option>
      </select>

      <div className="flex">
        <button
          type="button"
          className="w-9 text-blue-500 hover:text-blue-600"
          onClick={() => setShowEditModal(true)}
        >
          編集
        </button>
        <button
          type="button"
          className="ml-2 w-9 text-red-500 hover:text-red-600"
          onClick={() => setShowRemoveModal(true)}
        >
          削除
        </button>
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
    </>
  );
}
