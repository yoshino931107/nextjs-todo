"use client";
import {
  useState,
  useEffect,
  Dispatch,
  SetStateAction,
  ReactElement,
} from "react";
import RemoveDialog from "./removeDialog";
import RestoreDialog from "./restoreDialog";
import getData from "./getData";
import { supabase } from "../utils/supabase/supabase";

export default function Task(props: {
  id: number;
  text: string;
  update_at: string;
  status: "未着手" | "着手" | "完了";
  priority: "高" | "中" | "低";
  taskList: Dispatch<SetStateAction<Array<ReactElement>>>;
  filterStatus: string;
  detail: string;
}) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [status, setStatus] = useState<"未着手" | "着手" | "完了">(
    props.status
  );

  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<
    Array<{ id: number; content: string; created_at: string }>
  >([]);
  const [newComment, setNewComment] = useState("");

  const fetchComments = async () => {
    const { data, error } = await supabase
      .from("comments")
      .select("*")
      .eq("task_id", id)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("コメント取得失敗:", error);
    } else {
      setComments(data || []);
    }
  };

  // コメント追加
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newComment) return;

    const { error } = await supabase
      .from("comments")
      .insert([{ task_id: id, content: newComment }]);

    if (error) {
      console.error("コメント追加失敗:", error);
    } else {
      setNewComment("");
      fetchComments(); // 追加後に再取得
    }
  };

  useEffect(() => {
    if (showComments) {
      fetchComments();
    }
  }, [showComments]);

  const priorityOptions = [
    { label: "高", value: 3 },
    { label: "中", value: 2 },
    { label: "低", value: 1 },
  ];

  const valueToLabel = (value: number): "高" | "中" | "低" => {
    switch (value) {
      case 3:
        return "高";
      case 2:
        return "中";
      case 1:
        return "低";
      default:
        return "中";
    }
  };

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

  const labelToValue = (label: "高" | "中" | "低"): number => {
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

  const [selectedPriority, setSelectedPriority] = useState<number | undefined>(
    undefined
  );

  useEffect(() => {
    if (props.priority) {
      setSelectedPriority(labelToValue(props.priority));
    }
  }, [props.priority]);

  const handlePriorityChange = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const newValue = Number(e.target.value); // ここは数値で受け取る
    setSelectedPriority(newValue);

    const newLabel = valueToLabel(newValue);

    const { error } = await supabase
      .from("tasks")
      .update({
        priority: newLabel,
        priority_value: newValue,
      })
      .eq("id", id);

    if (error) {
      console.error("優先度の更新に失敗しました:", error);
    }
  };

  // 以下、EditDialog用のstate
  const [editText, setEditText] = useState(text);
  const [editDetail, setEditDetail] = useState(props.detail);

  useEffect(() => {
    setEditText(text);
    setEditDetail(props.detail);
  }, [text, props.detail]);

  return (
    <div className="mb-4 border-b pb-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
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
          {priorityOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <div className="flex items-center">
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
      </div>

      {props.detail && (
        <div className="mt-2 w-full">
          <p className="border border-gray-300 rounded-lg px-2 py-1 text-sm text-gray-500 whitespace-pre-wrap">
            {props.detail}
          </p>
        </div>
      )}

      <button
        className="mt-2 w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg px-4 py-2"
        onClick={() => setShowComments(!showComments)}
      >
        {showComments ? "コメントを閉じる" : "コメントを見る"}
      </button>

      {showComments && (
        <div className="mt-2">
          {comments.map((c) => (
            <div key={c.id} className="text-sm text-gray-700 mb-2">
              <p>💬 {c.content}</p>
              <p className="text-xs text-gray-400">
                投稿日時: {new Date(c.created_at).toLocaleString("ja-JP")}
              </p>
            </div>
          ))}

          <form onSubmit={handleSubmit}>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg px-2 py-1"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="コメントを書く"
            />
            <button
              className="mt-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg px-4 py-2"
              type="submit"
            >
              追加
            </button>
          </form>
        </div>
      )}

      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">タスクを編集</h2>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const { error } = await supabase
                  .from("tasks")
                  .update({ text: editText, detail: editDetail })
                  .eq("id", id);

                if (error) {
                  alert("更新に失敗しました");
                  console.error(error);
                } else {
                  setShowEditModal(false);
                  getData(props.taskList);
                }
              }}
            >
              <input
                type="text"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="w-full border px-2 py-1 mb-2 rounded"
              />
              <textarea
                value={editDetail}
                onChange={(e) => setEditDetail(e.target.value)}
                className="w-full border px-2 py-1 mb-4 rounded"
                rows={4}
              />
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
                >
                  更新
                </button>
              </div>
            </form>
          </div>
        </div>
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
    </div>
  );
}
