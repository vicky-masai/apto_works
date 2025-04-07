"use client"

import React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, CheckCircle, Clock, DollarSign, Upload } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { acceptTask } from "@/API/api"
import Cookies from "js-cookie"

export default function TaskAcceptPage({ params }: { params: Promise<{ id: string }> }) {
  const [step, setStep] = useState(1)
  const [proofText, setProofText] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const token = Cookies.get("token");
  const router = useRouter();
  const { id: Id } = React.use(params);

  useEffect(() => {
    if (!token) {
      router.push("/login");
    }
  }, [token, router]);

  // Mock task data - in a real app, this would be fetched from an API
  const task = {
    id: Id,
    title: "Website Registration Task",
    description: "Complete registration on platform and verify email",
    price: 5.0,
    category: "Registration",
    difficulty: "Easy",
    estimatedTime: "5 min",
    instructions: [
      "Go to example.com/register",
      "Create a new account with your email",
      "Verify your email address by clicking the link in the verification email",
      "Complete your profile with required information",
      "Take a screenshot of your completed profile page",
    ],
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleSubmit = () => {
    setIsSubmitting(true)
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      setIsCompleted(true)
      setStep(3)
    }, 2000)
  }

  return (
    <div className="container py-6 max-w-4xl m-auto">
      <div className="mb-6">
        <Link href="/tasks" className="flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Tasks
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>{task.title}</CardTitle>
              <CardDescription>{task.description}</CardDescription>
            </CardHeader>
            <CardContent>
              {step === 1 && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium mb-2">Task Instructions</h3>
                    <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                      {task.instructions.map((instruction, index) => (
                        <li key={index}>{instruction}</li>
                      ))}
                    </ol>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {task.estimatedTime}
                      </Badge>
                      <Badge variant="outline" className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        {task.price.toFixed(2)}
                      </Badge>
                    </div>
                    <Button onClick={() => setStep(2)}>Start Task</Button>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium mb-2">Submit Proof of Completion</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Please provide details about how you completed the task and upload any required proof.
                    </p>

                    <div className="space-y-4">
                      <div>
                        <label htmlFor="proof" className="text-sm font-medium">
                          Describe how you completed the task
                        </label>
                        <Textarea
                          id="proof"
                          placeholder="I registered on the website using my email..."
                          className="mt-1"
                          value={proofText}
                          onChange={(e) => setProofText(e.target.value)}
                        />
                      </div>

                      <div>
                        <label htmlFor="file" className="text-sm font-medium">
                          Upload Screenshot or Proof
                        </label>
                        <div className="mt-1 flex items-center justify-center w-full">
                          <label
                            htmlFor="file-upload"
                            className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted"
                          >
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                              <p className="mb-2 text-sm text-muted-foreground">
                                <span className="font-semibold">Click to upload</span> or drag and drop
                              </p>
                              <p className="text-xs text-muted-foreground">PNG, JPG or PDF (MAX. 10MB)</p>
                            </div>
                            <input
                              id="file-upload"
                              type="file"
                              className="hidden"
                              onChange={handleFileChange}
                              accept="image/png, image/jpeg, application/pdf"
                            />
                          </label>
                        </div>
                        {file && <p className="text-sm mt-2 text-muted-foreground">Selected file: {file.name}</p>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Button variant="outline" onClick={() => setStep(1)}>
                      Back
                    </Button>
                    <Button onClick={handleSubmit} disabled={!proofText || !file || isSubmitting}>
                      {isSubmitting ? "Submitting..." : "Submit Proof"}
                    </Button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <div className="flex flex-col items-center justify-center py-6">
                    <div className="rounded-full bg-green-100 p-3 text-green-600 mb-4">
                      <CheckCircle className="h-8 w-8" />
                    </div>
                    <h3 className="text-xl font-medium text-center">Task Submitted Successfully!</h3>
                    <p className="text-center text-muted-foreground mt-2">
                      Your submission is now being reviewed by the task provider. You will be notified once it's
                      approved.
                    </p>
                  </div>

                  <div className="flex items-center justify-center">
                    <Link href="/tasks">
                      <Button>Find More Tasks</Button>
                    </Link>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Task Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Progress</span>
                    <span>{step === 1 ? "0%" : step === 2 ? "50%" : "100%"}</span>
                  </div>
                  <Progress value={step === 1 ? 0 : step === 2 ? 50 : 100} className="h-2" />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center">
                    <div
                      className={`rounded-full w-6 h-6 flex items-center justify-center mr-3 ${
                        step >= 1 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      1
                    </div>
                    <span className={step >= 1 ? "font-medium" : "text-muted-foreground"}>Review Instructions</span>
                  </div>
                  <div className="flex items-center">
                    <div
                      className={`rounded-full w-6 h-6 flex items-center justify-center mr-3 ${
                        step >= 2 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      2
                    </div>
                    <span className={step >= 2 ? "font-medium" : "text-muted-foreground"}>Submit Proof</span>
                  </div>
                  <div className="flex items-center">
                    <div
                      className={`rounded-full w-6 h-6 flex items-center justify-center mr-3 ${
                        step >= 3 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      3
                    </div>
                    <span className={step >= 3 ? "font-medium" : "text-muted-foreground"}>Get Paid</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

