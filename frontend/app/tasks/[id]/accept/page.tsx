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
import { acceptTask, getAcceptedTaskById, submitProof } from "@/API/api"
import Cookies from "js-cookie"

export default function TaskAcceptPage({ params }: { params: Promise<{ id: string }> }) {
  const [step, setStep] = useState(1)
  const [proofText, setProofText] = useState("")
  const [files, setFiles] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [task, setTask] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const token = Cookies.get("token");
  const router = useRouter();
  const { id: Id } = React.use(params);

  // Load saved step from cookies
  useEffect(() => {
    const savedStep = Cookies.get(`task_${Id}_step`);
    if (savedStep) {
      setStep(parseInt(savedStep));
    }
  }, [Id]);

  // Save step to cookies whenever it changes
  useEffect(() => {
    if (step > 1) {
      Cookies.set(`task_${Id}_step`, step.toString(), { expires: 7 }); // Expires in 7 days
    }
  }, [step, Id]);

  useEffect(() => {
    if (!token) {
      router.push("/login");
    } else {
      // Fetch task data and accept the task
      const fetchTaskAndAccept = async () => {
        try {
          const taskData = await getAcceptedTaskById(Id, token);
          setTask(taskData.task);
          // await acceptTask(Id, token);
          setIsLoading(false);
        } catch (error) {
          console.error("Error:", error);
          // Handle error appropriately
        }
      };
      fetchTaskAndAccept();
    }
  }, [token, router, Id]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles(prevFiles => [...prevFiles, ...newFiles]);
    }
  }

  const handleRemoveFile = (index: number) => {
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  }

  const handleSubmit = async () => {
    if (files.length === 0) return;
    
    setIsSubmitting(true);
    try {
      const response = await submitProof(Id, files, proofText, token);
      if (response.data) {
        setIsCompleted(true);
        setStep(3);
      }
    } catch (error) {
      console.error('Error submitting proof:', error);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="container py-6 max-w-4xl m-auto">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="container py-6 max-w-4xl m-auto">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Task Not Found</h2>
          <Link href="/tasks">
            <Button>Back to Tasks</Button>
          </Link>
        </div>
      </div>
    );
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
              <CardTitle>{task.taskTitle}</CardTitle>
              <CardDescription>{task.taskDescription}</CardDescription>
            </CardHeader>
            <CardContent>
              {step === 1 && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium mb-2">Task Instructions</h3>
                    {/* <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                      {task.stepByStepInstructions.map((instruction: string, index: number) => (
                        <li key={index}>{instruction}</li>
                      ))}
                    </ol> */}
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
                          Describe how you completed the task (Optional)
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
                          Upload Screenshots, Videos or PDFs
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
                              <p className="text-xs text-muted-foreground">PNG, JPG, PDF or MP4 (MAX. 10MB each)</p>
                            </div>
                            <input
                              id="file-upload"
                              type="file"
                              className="hidden"
                              onChange={handleFileChange}
                              accept="image/png, image/jpeg, application/pdf, video/mp4"
                              multiple
                            />
                          </label>
                        </div>
                        
                        {files.length > 0 && (
                          <div className="mt-4 grid grid-cols-2 gap-4">
                            {files.map((file, index) => (
                              <div key={index} className="relative group">
                                {file.type.startsWith('image/') && (
                                  <img
                                    src={URL.createObjectURL(file)}
                                    alt={`Preview ${index + 1}`}
                                    className="w-full h-32 object-cover rounded-lg"
                                  />
                                )}
                                {file.type === 'application/pdf' && (
                                  <div className="w-full h-32 bg-muted rounded-lg flex items-center justify-center">
                                    <span className="text-muted-foreground">PDF Preview</span>
                                  </div>
                                )}
                                {file.type.startsWith('video/') && (
                                  <video
                                    src={URL.createObjectURL(file)}
                                    className="w-full h-32 object-cover rounded-lg"
                                    controls
                                  />
                                )}
                                <button
                                  onClick={() => handleRemoveFile(index)}
                                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                  </svg>
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Button variant="outline" onClick={() => setStep(1)}>
                      Back
                    </Button>
                    <Button onClick={handleSubmit} disabled={files.length === 0 || isSubmitting}>
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

