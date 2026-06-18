"use client"

import { Suspense, useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Sidebar } from "@/features/dashboard"
import { catalogAPI } from "@/api/catalog-api"
import { toast } from "sonner"
import {
  ArrowLeft,
  Plus,
  Trash2,
  GripVertical,
  Save,
  Sparkles,
  Layers,
  ListChecks,
  CheckCircle2,
  Circle,
  ChevronDown,
} from "lucide-react"
import Link from "next/link"
import "@/styles/global.css"

interface LevelDraft {
  title: string
  description: string
  content: string
  videoUrl: string
  duration: number
  quizTitle: string
  quizQuestions: Array<{
    questionText: string
    options: Array<{ optionText: string; isCorrect: boolean }>
  }>
}

function emptyLevel(): LevelDraft {
  return {
    title: "",
    description: "",
    content: "",
    videoUrl: "",
    duration: 30,
    quizTitle: "",
    quizQuestions: [
      {
        questionText: "",
        options: [
          { optionText: "", isCorrect: true },
          { optionText: "", isCorrect: false },
          { optionText: "", isCorrect: false },
        ],
      },
    ],
  }
}

export default function NewCoursePage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)

  // Course fields
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [instructor, setInstructor] = useState("")
  const [category, setCategory] = useState("")
  const [difficulty, setDifficulty] = useState("beginner")
  const [duration, setDuration] = useState(10)
  const [price, setPrice] = useState(0)
  const [imageUrl, setImageUrl] = useState("")
  const [tags, setTags] = useState("")

  // Levels
  const [levels, setLevels] = useState<LevelDraft[]>([emptyLevel()])

  const updateLevel = (idx: number, patch: Partial<LevelDraft>) => {
    setLevels((prev) => prev.map((l, i) => (i === idx ? { ...l, ...patch } : l)))
  }

  const addLevel = () => setLevels((prev) => [...prev, emptyLevel()])
  const removeLevel = (idx: number) => {
    if (levels.length <= 1) return
    setLevels((prev) => prev.filter((_, i) => i !== idx))
  }

  const addQuestion = (levelIdx: number) => {
    setLevels((prev) =>
      prev.map((l, i) =>
        i === levelIdx
          ? {
              ...l,
              quizQuestions: [
                ...l.quizQuestions,
                {
                  questionText: "",
                  options: [
                    { optionText: "", isCorrect: true },
                    { optionText: "", isCorrect: false },
                    { optionText: "", isCorrect: false },
                  ],
                },
              ],
            }
          : l
      )
    )
  }

  const removeQuestion = (levelIdx: number, qIdx: number) => {
    setLevels((prev) =>
      prev.map((l, i) =>
        i === levelIdx
          ? { ...l, quizQuestions: l.quizQuestions.filter((_, j) => j !== qIdx) }
          : l
      )
    )
  }

  const updateQuestion = (
    levelIdx: number,
    qIdx: number,
    field: string,
    value: string
  ) => {
    setLevels((prev) =>
      prev.map((l, i) =>
        i === levelIdx
          ? {
              ...l,
              quizQuestions: l.quizQuestions.map((q, j) =>
                j === qIdx ? { ...q, [field]: value } : q
              ),
            }
          : l
      )
    )
  }

  const updateOption = (
    levelIdx: number,
    qIdx: number,
    oIdx: number,
    field: string,
    value: string | boolean
  ) => {
    setLevels((prev) =>
      prev.map((l, i) =>
        i === levelIdx
          ? {
              ...l,
              quizQuestions: l.quizQuestions.map((q, j) =>
                j === qIdx
                  ? {
                      ...q,
                      options: q.options.map((o, k) => {
                        if (field === "isCorrect") {
                          // Only one correct answer per question
                          return k === oIdx
                            ? { ...o, isCorrect: true }
                            : { ...o, isCorrect: false }
                        }
                        return k === oIdx ? { ...o, [field]: value } : o
                      }),
                    }
                  : q
              ),
            }
          : l
      )
    )
  }

  const handleSave = async () => {
    if (!title.trim() || !description.trim() || !instructor.trim()) {
      toast.error("Title, description, and instructor are required")
      return
    }

    setSaving(true)
    try {
      const payload = {
        courseData: {
          title: title.trim(),
          description: description.trim(),
          instructor: instructor.trim(),
          category: category.trim() || "General",
          difficulty,
          duration,
          price,
          imageUrl: imageUrl.trim() || undefined,
        },
        levels: levels.map((l, idx) => ({
          title: l.title.trim() || `Level ${idx + 1}`,
          description: l.description.trim() || `Level ${idx + 1} content`,
          order: idx + 1,
          content: l.content.trim() || undefined,
          videoUrl: l.videoUrl.trim() || undefined,
          duration: l.duration,
          quizzes:
            l.quizQuestions.length > 0 && l.quizQuestions[0].questionText.trim()
              ? [
                  {
                    title: l.quizTitle.trim() || `${l.title || `Level ${idx + 1}`} Quiz`,
                    passingScore: 70,
                    timeLimit: 10,
                    questions: l.quizQuestions
                      .filter((q) => q.questionText.trim())
                      .map((q) => ({
                        questionText: q.questionText.trim(),
                        questionType: "multiple_choice",
                        points: 1,
                        options: q.options
                          .map((o) => ({
                            optionText: o.optionText.trim(),
                            isCorrect: o.isCorrect,
                          }))
                          .filter((o) => o.optionText),
                      })),
                  },
                ]
              : undefined,
        })),
        tags: tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      }

      await catalogAPI.createCourse(payload)
      toast.success("Course created successfully!")
      router.push("/admin/courses")
    } catch (e: any) {
      toast.error(e.message || "Failed to create course")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="aurora-bg min-h-screen bg-background text-foreground overflow-x-hidden">
      <aside
        aria-label="Sidebar navigation"
        className="fixed left-0 top-0 h-full w-72 p-4 sidebar-glass z-10"
      >
        <Suspense>
          <Sidebar />
        </Suspense>
      </aside>

      <main className="ml-72 min-h-screen">
        {/* Sticky authoring header */}
        <div className="sticky top-0 z-20 glass-strong border-b border-white/10 px-8 py-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <Button
                variant="glass"
                size="icon"
                asChild
                aria-label="Back to courses"
                className="h-9 w-9 shrink-0"
              >
                <Link href="/admin/courses">
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
              <div className="min-w-0">
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  Authoring
                </p>
                <h1 className="font-display text-xl font-semibold tracking-tight truncate">
                  <span className="text-gradient">
                    {title.trim() || "Create New Course"}
                  </span>
                </h1>
              </div>
            </div>
            <Button
              onClick={handleSave}
              disabled={saving}
              variant="glow"
              className="gap-1.5 shrink-0"
            >
              {saving ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {saving ? "Saving…" : "Create Course"}
            </Button>
          </div>
        </div>

        <div className="px-8 py-8">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Course Details */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              <Card className="card-premium">
                <CardHeader>
                  <CardTitle className="font-display text-lg flex items-center gap-2">
                    <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-indigo-500/30 to-violet-500/20 ring-1 ring-inset ring-white/10">
                      <Sparkles className="h-4 w-4 text-indigo-300" />
                    </span>
                    Course Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5 md:col-span-2">
                      <Label>Title *</Label>
                      <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g. React Fundamentals"
                        className="glass border-white/10 focus-visible:border-indigo-400/50"
                      />
                    </div>
                    <div className="space-y-1.5 md:col-span-2">
                      <Label>Description *</Label>
                      <Textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Course description…"
                        rows={3}
                        className="glass border-white/10 focus-visible:border-indigo-400/50"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Instructor *</Label>
                      <Input
                        value={instructor}
                        onChange={(e) => setInstructor(e.target.value)}
                        placeholder="Dr. Jane Smith"
                        className="glass border-white/10 focus-visible:border-indigo-400/50"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Category</Label>
                      <Input
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        placeholder="e.g. Web Development"
                        className="glass border-white/10 focus-visible:border-indigo-400/50"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Difficulty</Label>
                      <Select value={difficulty} onValueChange={setDifficulty}>
                        <SelectTrigger className="glass border-white/10">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="beginner">Beginner</SelectItem>
                          <SelectItem value="intermediate">Intermediate</SelectItem>
                          <SelectItem value="advanced">Advanced</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Duration (hours)</Label>
                      <Input
                        type="number"
                        value={duration}
                        onChange={(e) => setDuration(Number(e.target.value))}
                        min={1}
                        className="glass border-white/10 focus-visible:border-indigo-400/50"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Price ($)</Label>
                      <Input
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(Number(e.target.value))}
                        min={0}
                        step={0.01}
                        className="glass border-white/10 focus-visible:border-indigo-400/50"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Image URL</Label>
                      <Input
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        placeholder="/images/courses/react-foundations.jpg"
                        className="glass border-white/10 focus-visible:border-indigo-400/50"
                      />
                    </div>
                    <div className="space-y-1.5 md:col-span-2">
                      <Label>Tags (comma separated)</Label>
                      <Input
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                        placeholder="React, JavaScript, Frontend"
                        className="glass border-white/10 focus-visible:border-indigo-400/50"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Levels */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-xl font-semibold flex items-center gap-2">
                  <Layers className="h-5 w-5 text-violet-300" />
                  Levels
                  <span className="chip">{levels.length}</span>
                </h2>
                <Button
                  variant="glass"
                  size="sm"
                  onClick={addLevel}
                  className="gap-1.5"
                >
                  <Plus className="h-4 w-4" />
                  Add Level
                </Button>
              </div>

              {levels.map((level, levelIdx) => (
                <LevelCard
                  key={levelIdx}
                  level={level}
                  levelIdx={levelIdx}
                  totalLevels={levels.length}
                  onRemove={() => removeLevel(levelIdx)}
                  onUpdateLevel={(patch) => updateLevel(levelIdx, patch)}
                  onAddQuestion={() => addQuestion(levelIdx)}
                  onRemoveQuestion={(qIdx) => removeQuestion(levelIdx, qIdx)}
                  onUpdateQuestion={(qIdx, field, value) =>
                    updateQuestion(levelIdx, qIdx, field, value)
                  }
                  onUpdateOption={(qIdx, oIdx, field, value) =>
                    updateOption(levelIdx, qIdx, oIdx, field, value)
                  }
                />
              ))}
            </div>

            {/* Bottom save */}
            <div className="flex justify-end pb-8">
              <Button
                onClick={handleSave}
                disabled={saving}
                variant="glow"
                className="gap-1.5"
              >
                <Save className="h-4 w-4" />
                {saving ? "Creating…" : "Create Course"}
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

/* ──────────────────────────────────────────────────────────────────
   Presentational sub-components (no behaviour change — all state and
   handlers stay in the page; these just render props/callbacks).
────────────────────────────────────────────────────────────────── */

interface LevelCardProps {
  level: LevelDraft
  levelIdx: number
  totalLevels: number
  onRemove: () => void
  onUpdateLevel: (patch: Partial<LevelDraft>) => void
  onAddQuestion: () => void
  onRemoveQuestion: (qIdx: number) => void
  onUpdateQuestion: (qIdx: number, field: string, value: string) => void
  onUpdateOption: (
    qIdx: number,
    oIdx: number,
    field: string,
    value: string | boolean
  ) => void
}

function LevelCard({
  level,
  levelIdx,
  totalLevels,
  onRemove,
  onUpdateLevel,
  onAddQuestion,
  onRemoveQuestion,
  onUpdateQuestion,
  onUpdateOption,
}: LevelCardProps) {
  const [open, setOpen] = useState(true)
  const questionCount = level.quizQuestions.length

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(levelIdx * 0.05, 0.3) }}
    >
      <Card className="card-premium overflow-hidden">
        {/* Collapsible header */}
        <div className="flex items-center justify-between gap-2 px-6 pt-1">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            className="group flex flex-1 items-center gap-2.5 rounded-lg py-1 text-left outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/50"
          >
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-indigo-500/25 to-violet-500/15 text-xs font-bold text-indigo-200 ring-1 ring-inset ring-white/10">
              {levelIdx + 1}
            </span>
            <span className="min-w-0">
              <span className="block truncate font-display text-base font-semibold">
                {level.title.trim() || `Level ${levelIdx + 1}`}
              </span>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <ListChecks className="h-3 w-3" />
                {questionCount} question{questionCount !== 1 ? "s" : ""}
              </span>
            </span>
            <ChevronDown
              className={`ml-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-300 ${
                open ? "rotate-180" : ""
              }`}
            />
          </button>
          <div className="flex items-center gap-1">
            <GripVertical className="h-4 w-4 text-muted-foreground/50" />
            {totalLevels > 1 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onRemove}
                aria-label={`Remove level ${levelIdx + 1}`}
                className="h-8 w-8 text-red-400 hover:bg-red-500/15 hover:text-red-300"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              key="body"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <CardContent className="space-y-4 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5 md:col-span-2">
                    <Label>Level Title</Label>
                    <Input
                      value={level.title}
                      onChange={(e) => onUpdateLevel({ title: e.target.value })}
                      placeholder={`Level ${levelIdx + 1}: Introduction`}
                      className="glass border-white/10 focus-visible:border-indigo-400/50"
                    />
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <Label>Description</Label>
                    <Input
                      value={level.description}
                      onChange={(e) =>
                        onUpdateLevel({ description: e.target.value })
                      }
                      placeholder="What students will learn…"
                      className="glass border-white/10 focus-visible:border-indigo-400/50"
                    />
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <Label>Content (Markdown supported)</Label>
                    <Textarea
                      value={level.content}
                      onChange={(e) => onUpdateLevel({ content: e.target.value })}
                      placeholder="Detailed learning content…"
                      rows={4}
                      className="glass border-white/10 focus-visible:border-indigo-400/50"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Video URL (optional)</Label>
                    <Input
                      value={level.videoUrl}
                      onChange={(e) => onUpdateLevel({ videoUrl: e.target.value })}
                      placeholder="https://youtube.com/watch?v=…"
                      className="glass border-white/10 focus-visible:border-indigo-400/50"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Duration (mins)</Label>
                    <Input
                      type="number"
                      value={level.duration}
                      onChange={(e) =>
                        onUpdateLevel({ duration: Number(e.target.value) })
                      }
                      min={1}
                      className="glass border-white/10 focus-visible:border-indigo-400/50"
                    />
                  </div>
                </div>

                {/* Quiz Section */}
                <div className="rounded-xl neu-inset p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wide text-indigo-200/90">
                      <ListChecks className="h-4 w-4" />
                      Quiz Builder
                    </h4>
                    <Button
                      variant="glass"
                      size="sm"
                      onClick={onAddQuestion}
                      className="gap-1 text-xs h-7"
                    >
                      <Plus className="h-3 w-3" />
                      Add Question
                    </Button>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs">Quiz Title</Label>
                    <Input
                      value={level.quizTitle}
                      onChange={(e) => onUpdateLevel({ quizTitle: e.target.value })}
                      placeholder={`Level ${levelIdx + 1} Quiz`}
                      className="glass border-white/10 focus-visible:border-indigo-400/50 text-sm"
                    />
                  </div>

                  {level.quizQuestions.map((q, qIdx) => (
                    <QuestionCard
                      key={qIdx}
                      question={q}
                      qIdx={qIdx}
                      levelIdx={levelIdx}
                      totalQuestions={level.quizQuestions.length}
                      onRemove={() => onRemoveQuestion(qIdx)}
                      onUpdateQuestion={(field, value) =>
                        onUpdateQuestion(qIdx, field, value)
                      }
                      onUpdateOption={(oIdx, field, value) =>
                        onUpdateOption(qIdx, oIdx, field, value)
                      }
                    />
                  ))}
                </div>
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  )
}

interface QuestionCardProps {
  question: {
    questionText: string
    options: Array<{ optionText: string; isCorrect: boolean }>
  }
  qIdx: number
  levelIdx: number
  totalQuestions: number
  onRemove: () => void
  onUpdateQuestion: (field: string, value: string) => void
  onUpdateOption: (oIdx: number, field: string, value: string | boolean) => void
}

function QuestionCard({
  question,
  qIdx,
  levelIdx,
  totalQuestions,
  onRemove,
  onUpdateQuestion,
  onUpdateOption,
}: QuestionCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <Card className="glass-subtle border-white/[0.07]">
        <CardContent className="p-3 space-y-2.5">
          <div className="flex items-start justify-between gap-2">
            <Label className="chip">Question {qIdx + 1}</Label>
            {totalQuestions > 1 && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-red-400 hover:bg-red-500/15 hover:text-red-300"
                onClick={onRemove}
                aria-label={`Remove question ${qIdx + 1}`}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
          <Input
            value={question.questionText}
            onChange={(e) => onUpdateQuestion("questionText", e.target.value)}
            placeholder="Enter question text…"
            className="glass border-white/10 focus-visible:border-indigo-400/50 text-sm"
          />
          <div className="space-y-1.5">
            {question.options.map((opt, oIdx) => (
              <label
                key={oIdx}
                className={`flex items-center gap-2 rounded-lg border px-2 py-1 transition-colors cursor-pointer ${
                  opt.isCorrect
                    ? "border-emerald-500/40 bg-emerald-500/[0.08]"
                    : "border-white/5 hover:border-white/15"
                }`}
              >
                <span className="relative grid place-items-center">
                  <input
                    type="radio"
                    name={`correct-${levelIdx}-${qIdx}`}
                    checked={opt.isCorrect}
                    onChange={() => onUpdateOption(oIdx, "isCorrect", true)}
                    className="peer sr-only"
                    title="Mark as correct answer"
                  />
                  {opt.isCorrect ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <Circle className="h-4 w-4 text-muted-foreground/50" />
                  )}
                </span>
                <Input
                  value={opt.optionText}
                  onChange={(e) =>
                    onUpdateOption(oIdx, "optionText", e.target.value)
                  }
                  placeholder={`Option ${oIdx + 1}`}
                  className="flex-1 border-0 bg-transparent px-1 text-sm shadow-none focus-visible:ring-0"
                />
                {opt.isCorrect && (
                  <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wide text-emerald-300">
                    Correct
                  </span>
                )}
              </label>
            ))}
            <p className="pl-1 text-xs text-muted-foreground">
              Select the circle next to the correct answer
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
