"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import * as XLSX from "xlsx";
import { z } from "zod";
import { Student, studentsApi } from "@/lib/api";

type ToastType = "success" | "error" | "info";

type Toast = {
  id: number;
  type: ToastType;
  message: string;
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const studentSchema = z.object({
  name: z.string().min(2, "Name is required").max(100),
  email: z.string().email("Enter a valid email").max(150),
  age: z.number().int().min(1).max(120),
});

type StudentFormValues = z.infer<typeof studentSchema>;

export default function HomePage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editing, setEditing] = useState<Student | null>(null);
  const [filter, setFilter] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Student | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<StudentFormValues>({
    resolver: zodResolver(studentSchema),
    defaultValues: { name: "", email: "", age: 18 },
  });

  const pushToast = (message: string, type: ToastType = "info") => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setToasts((prev) => [...prev, { id, type, message }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 3200);
  };

  const loadStudents = async (showRefresh = false) => {
    if (showRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError(null);
    try {
      const [data] = await Promise.all([studentsApi.list(), delay(450)]);
      setStudents(data);
      if (showRefresh) {
        pushToast("Student list refreshed.", "success");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load students.";
      setError(message);
      pushToast(message, "error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  useEffect(() => {
    if (editing) {
      reset({
        name: editing.name,
        email: editing.email,
        age: editing.age,
      });
    } else {
      reset({ name: "", email: "", age: 18 });
    }
  }, [editing, reset]);

  const filteredStudents = useMemo(() => {
    const query = filter.trim().toLowerCase();
    if (!query) return students;
    return students.filter(
      (student) =>
        student.name.toLowerCase().includes(query) ||
        student.email.toLowerCase().includes(query),
    );
  }, [filter, students]);

  const exportExcel = (data: Student[], label: string) => {
    if (!data.length) {
      pushToast("No students available to export.", "info");
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(
      data.map((student) => ({
        Name: student.name,
        Email: student.email,
        Age: student.age,
      })),
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Students");
    const filename = `students_${label}_${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(workbook, filename);
    pushToast(`Exported ${data.length} student${data.length > 1 ? "s" : ""}.`, "success");
  };

  const onSubmit = async (values: StudentFormValues) => {
    setSaving(true);
    setError(null);
    try {
      await delay(300);
      if (editing) {
        await studentsApi.update(editing.id, values);
        pushToast("Student updated.", "success");
        setEditing(null);
      } else {
        await studentsApi.create(values);
        pushToast("Student added.", "success");
      }
      await loadStudents();
      reset({ name: "", email: "", age: 18 });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to save student.";
      setError(message);
      pushToast(message, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    setDeleting(true);
    setError(null);
    try {
      await delay(300);
      await studentsApi.remove(confirmDelete.id);
      pushToast("Student deleted.", "success");
      setConfirmDelete(null);
      await loadStudents();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to delete student.";
      setError(message);
      pushToast(message, "error");
    } finally {
      setDeleting(false);
    }
  };

  const totalCount = students.length;
  const filteredCount = filteredStudents.length;

  return (
    <div className="min-h-screen px-4 py-8 text-[15px] md:px-8 md:py-12 lg:px-12">
      <div className="fixed right-4 top-4 z-[70] flex w-[min(92vw,360px)] flex-col gap-2" aria-live="polite">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`toast-in rounded-2xl border px-4 py-3 text-sm shadow-lg backdrop-blur ${
              toast.type === "success"
                ? "border-emerald-200 bg-emerald-50/95 text-emerald-800"
                : toast.type === "error"
                  ? "border-rose-200 bg-rose-50/95 text-rose-700"
                  : "border-slate-200 bg-white/95 text-slate-700"
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>

      <div className="page-in mx-auto flex w-full max-w-6xl flex-col gap-8 md:gap-10">
        <header className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
              Student Ledger
            </p>
            <h1 className="font-[var(--font-display)] text-3xl font-semibold leading-tight sm:text-4xl md:text-5xl">
              Manage student profiles with clarity and speed.
            </h1>
            <p className="max-w-2xl text-sm text-[var(--muted)] sm:text-base">
              Create, edit, filter, and export student data from a single workspace. Everything is synced with your secure backend.
            </p>
          </div>
          <div className="surface-card w-full rounded-2xl px-5 py-4 md:w-auto">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
              Live Snapshot
            </p>
            <div className="mt-2 text-2xl font-semibold">{totalCount}</div>
            <p className="text-sm text-[var(--muted)]">Total students</p>
          </div>
        </header>

        <section className="grid gap-6 xl:grid-cols-[1.05fr_1.65fr]">
          <div className="surface-card rounded-3xl p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-[var(--font-display)] text-2xl font-semibold">
                {editing ? "Edit Student" : "Add Student"}
              </h2>
              {editing && (
                <button
                  type="button"
                  className="secondary-btn rounded-full px-3 py-1.5 text-sm font-medium text-[var(--accent)]"
                  onClick={() => setEditing(null)}
                >
                  Cancel edit
                </button>
              )}
            </div>

            <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                  Name
                </label>
                <input
                  className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                  placeholder="Student name"
                  {...register("name")}
                />
                {errors.name && <p className="mt-1 text-xs text-rose-600">{errors.name.message}</p>}
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                  Email
                </label>
                <input
                  className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                  placeholder="name@email.com"
                  type="email"
                  {...register("email")}
                />
                {errors.email && <p className="mt-1 text-xs text-rose-600">{errors.email.message}</p>}
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                  Age
                </label>
                <input
                  className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                  placeholder="18"
                  type="number"
                  min={1}
                  max={120}
                  {...register("age", { valueAsNumber: true })}
                />
                {errors.age && <p className="mt-1 text-xs text-rose-600">{errors.age.message}</p>}
              </div>

              {error && (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={saving}
                className="primary-btn w-full rounded-2xl px-4 py-3 text-sm font-semibold text-white disabled:opacity-70"
              >
                {saving ? "Saving..." : editing ? "Save Changes" : "Add Student"}
              </button>
            </form>
          </div>

          <div className="surface-card rounded-3xl p-5 sm:p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="font-[var(--font-display)] text-2xl font-semibold">
                  Student List
                </h2>
                <p className="text-sm text-[var(--muted)]">
                  Showing {filteredCount} of {totalCount} students
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className="secondary-btn rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[var(--muted)]"
                  onClick={() => exportExcel(filteredStudents, "filtered")}
                >
                  Export Current
                </button>
                <button
                  type="button"
                  className="secondary-btn rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[var(--muted)]"
                  onClick={() => exportExcel(students, "all")}
                >
                  Export All
                </button>
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <input
                className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] sm:max-w-sm"
                placeholder="Search by name or email"
                value={filter}
                onChange={(event) => setFilter(event.target.value)}
              />
              <button
                type="button"
                className="secondary-btn inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[var(--muted)]"
                onClick={() => loadStudents(true)}
                disabled={loading || refreshing}
              >
                {(loading || refreshing) && (
                  <span className="h-3 w-3 animate-spin rounded-full border-2 border-[var(--muted)] border-t-transparent" />
                )}
                Refresh
              </button>
            </div>

            <div className="mt-6 overflow-hidden rounded-2xl border border-[var(--border)]">
              <div className="hidden grid-cols-[1.3fr_1.6fr_0.5fr_0.7fr] bg-[#f7f3ee] px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--muted)] md:grid">
                <span>Name</span>
                <span>Email</span>
                <span>Age</span>
                <span>Actions</span>
              </div>

              <div className="divide-y divide-[var(--border)]">
                {loading ? (
                  <div className="space-y-3 px-4 py-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={`sk-${i}`} className="grid grid-cols-1 gap-2 md:grid-cols-[1.3fr_1.6fr_0.5fr_0.7fr] md:items-center">
                        <div className="skeleton h-4 rounded" />
                        <div className="skeleton h-4 rounded" />
                        <div className="skeleton h-4 w-10 rounded" />
                        <div className="skeleton h-4 w-20 rounded" />
                      </div>
                    ))}
                  </div>
                ) : filteredStudents.length === 0 ? (
                  <div className="px-4 py-8 text-center text-sm text-[var(--muted)]">
                    No students found. Add a new record to get started.
                  </div>
                ) : (
                  filteredStudents.map((student) => (
                    <div key={student.id}>
                      <div className="hidden grid-cols-[1.3fr_1.6fr_0.5fr_0.7fr] items-center px-4 py-4 text-sm md:grid">
                        <span className="font-medium">{student.name}</span>
                        <span className="text-[var(--muted)]">{student.email}</span>
                        <span>{student.age}</span>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            className="text-xs font-semibold uppercase tracking-wider text-[var(--accent)] hover:text-[var(--accent-strong)]"
                            onClick={() => setEditing(student)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="text-xs font-semibold uppercase tracking-wider text-rose-600 hover:text-rose-700"
                            onClick={() => setConfirmDelete(student)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>

                      <div className="space-y-3 px-4 py-4 md:hidden">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-xs uppercase tracking-wider text-[var(--muted)]">Name</p>
                            <p className="font-medium">{student.name}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs uppercase tracking-wider text-[var(--muted)]">Age</p>
                            <p className="font-medium">{student.age}</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-wider text-[var(--muted)]">Email</p>
                          <p className="break-all text-sm text-[var(--muted)]">{student.email}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            className="secondary-btn flex-1 rounded-xl px-3 py-2 text-xs font-semibold uppercase tracking-wider text-[var(--accent)]"
                            onClick={() => setEditing(student)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="flex-1 rounded-xl border border-rose-200 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-rose-600 hover:bg-rose-50"
                            onClick={() => setConfirmDelete(student)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </section>
      </div>

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <h3 className="font-[var(--font-display)] text-2xl font-semibold">
              Delete Student?
            </h3>
            <p className="mt-2 text-sm text-[var(--muted)]">
              This will permanently remove <span className="font-semibold text-[var(--foreground)]">{confirmDelete.name}</span> from your records.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                className="secondary-btn flex-1 rounded-2xl px-4 py-3 text-sm font-semibold"
                onClick={() => setConfirmDelete(null)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="danger-btn flex-1 rounded-2xl px-4 py-3 text-sm font-semibold text-white disabled:opacity-70"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}