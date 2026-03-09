"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import * as XLSX from "xlsx";
import { z } from "zod";
import { Student, studentsApi } from "@/lib/api";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const studentSchema = z.object({
  name: z.string().min(2, "Name is required").max(100),
  email: z.string().email("Enter a valid email").max(150),
  age: z.coerce.number().int().min(1).max(120),
});

type StudentFormValues = z.infer<typeof studentSchema>;

export default function HomePage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editing, setEditing] = useState<Student | null>(null);
  const [filter, setFilter] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Student | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<StudentFormValues>({
    resolver: zodResolver(studentSchema),
    defaultValues: { name: "", email: "", age: 18 },
  });

  const loadStudents = async () => {
    setLoading(true);
    setError(null);
    try {
      const [data] = await Promise.all([studentsApi.list(), delay(500)]);
      setStudents(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load students.");
    } finally {
      setLoading(false);
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
    const worksheet = XLSX.utils.json_to_sheet(
      data.map((student) => ({
        Name: student.name,
        Email: student.email,
        Age: student.age,
      })),
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Students");
    const filename = `students_${label}_${new Date()
      .toISOString()
      .slice(0, 10)}.xlsx`;
    XLSX.writeFile(workbook, filename);
  };

  const onSubmit = async (values: StudentFormValues) => {
    setSaving(true);
    setError(null);
    try {
      await delay(350);
      if (editing) {
        await studentsApi.update(editing.id, values);
        setEditing(null);
      } else {
        await studentsApi.create(values);
      }
      await loadStudents();
      reset({ name: "", email: "", age: 18 });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save student.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    setDeleting(true);
    setError(null);
    try {
      await delay(350);
      await studentsApi.remove(confirmDelete.id);
      setConfirmDelete(null);
      await loadStudents();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete student.");
    } finally {
      setDeleting(false);
    }
  };

  const totalCount = students.length;
  const filteredCount = filteredStudents.length;

  return (
    <div className="min-h-screen px-6 py-12 text-[15px] md:px-12">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10">
        <header className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
              Student Ledger
            </p>
            <h1 className="font-[var(--font-display)] text-4xl font-semibold leading-tight md:text-5xl">
              Manage student profiles with clarity and speed.
            </h1>
            <p className="max-w-2xl text-base text-[var(--muted)]">
              Create, edit, filter, and export student data from a single
              workspace. Everything is synced with your secure backend.
            </p>
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-5 py-4 shadow-[var(--shadow)]">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
              Live Snapshot
            </p>
            <div className="mt-2 text-2xl font-semibold">{totalCount}</div>
            <p className="text-sm text-[var(--muted)]">Total students</p>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_1.6fr]">
          <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow)]">
            <div className="flex items-center justify-between">
              <h2 className="font-[var(--font-display)] text-2xl font-semibold">
                {editing ? "Edit Student" : "Add Student"}
              </h2>
              {editing && (
                <button
                  className="text-sm font-medium text-[var(--accent)] hover:text-[var(--accent-strong)]"
                  onClick={() => setEditing(null)}
                >
                  Cancel edit
                </button>
              )}
            </div>

            <form
              className="mt-6 space-y-4"
              onSubmit={handleSubmit(onSubmit)}
            >
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                  Name
                </label>
                <input
                  className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm focus:border-[var(--accent)] focus:outline-none"
                  placeholder="Student name"
                  {...register("name")}
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-rose-600">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                  Email
                </label>
                <input
                  className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm focus:border-[var(--accent)] focus:outline-none"
                  placeholder="name@email.com"
                  type="email"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-rose-600">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                  Age
                </label>
                <input
                  className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm focus:border-[var(--accent)] focus:outline-none"
                  placeholder="18"
                  type="number"
                  min={1}
                  max={120}
                  {...register("age", { valueAsNumber: true })}
                />
                {errors.age && (
                  <p className="mt-1 text-xs text-rose-600">
                    {errors.age.message}
                  </p>
                )}
              </div>

              {error && (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-2xl bg-[var(--accent)] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-200 transition hover:bg-[var(--accent-strong)] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {saving
                  ? "Saving..."
                  : editing
                    ? "Save Changes"
                    : "Add Student"}
              </button>
            </form>
          </div>

          <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow)]">
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
                  className="rounded-full border border-[var(--border)] px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[var(--muted)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
                  onClick={() => exportExcel(filteredStudents, "filtered")}
                >
                  Export Current
                </button>
                <button
                  className="rounded-full border border-[var(--border)] px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[var(--muted)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
                  onClick={() => exportExcel(students, "all")}
                >
                  Export All
                </button>
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <input
                className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm focus:border-[var(--accent)] focus:outline-none md:max-w-sm"
                placeholder="Search by name or email"
                value={filter}
                onChange={(event) => setFilter(event.target.value)}
              />
              <button
                className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)] transition hover:text-[var(--accent)]"
                onClick={loadStudents}
              >
                Refresh
              </button>
            </div>

            <div className="mt-6 overflow-hidden rounded-2xl border border-[var(--border)]">
              <div className="grid grid-cols-[1.3fr_1.6fr_0.5fr_0.6fr] bg-[#f7f3ee] px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                <span>Name</span>
                <span>Email</span>
                <span>Age</span>
                <span>Actions</span>
              </div>
              <div className="divide-y divide-[var(--border)]">
                {loading ? (
                  <div className="px-4 py-6 text-sm text-[var(--muted)]">
                    Loading students...
                  </div>
                ) : filteredStudents.length === 0 ? (
                  <div className="px-4 py-6 text-sm text-[var(--muted)]">
                    No students found. Add a new record to get started.
                  </div>
                ) : (
                  filteredStudents.map((student) => (
                    <div
                      key={student.id}
                      className="grid grid-cols-[1.3fr_1.6fr_0.5fr_0.6fr] items-center px-4 py-4 text-sm"
                    >
                      <span className="font-medium">{student.name}</span>
                      <span className="text-[var(--muted)]">
                        {student.email}
                      </span>
                      <span>{student.age}</span>
                      <div className="flex items-center gap-3">
                        <button
                          className="text-xs font-semibold uppercase tracking-wider text-[var(--accent)]"
                          onClick={() => setEditing(student)}
                        >
                          Edit
                        </button>
                        <button
                          className="text-xs font-semibold uppercase tracking-wider text-rose-600"
                          onClick={() => setConfirmDelete(student)}
                        >
                          Delete
                        </button>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <h3 className="font-[var(--font-display)] text-2xl font-semibold">
              Delete Student?
            </h3>
            <p className="mt-2 text-sm text-[var(--muted)]">
              This will permanently remove{" "}
              <span className="font-semibold text-[var(--foreground)]">
                {confirmDelete.name}
              </span>{" "}
              from your records.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                className="flex-1 rounded-2xl border border-[var(--border)] px-4 py-3 text-sm font-semibold"
                onClick={() => setConfirmDelete(null)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                className="flex-1 rounded-2xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white disabled:opacity-70"
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
