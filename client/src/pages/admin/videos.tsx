import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Video, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter,
  Calendar,
  Clock,
  Eye,
  EyeOff,
  Link as LinkIcon,
  Save,
  X
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";

interface Course {
  id: string;
  title: string;
  slug: string;
}

interface VideoData {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  externalUrl: string;
  durationSec?: number;
  isPublished: boolean;
  accessStart?: string;
  accessEnd?: string;
  createdAt: string;
  updatedAt: string;
  course?: Course;
}

const videoFormSchema = z.object({
  courseId: z.string().min(1, "강의 과정을 선택해주세요"),
  title: z.string().min(1, "제목을 입력해주세요"),
  description: z.string().optional(),
  externalUrl: z.string().url("올바른 URL을 입력해주세요"),
  durationSec: z.number().optional(),
  isPublished: z.boolean(),
  accessStart: z.string().optional(),
  accessEnd: z.string().optional(),
});

type VideoFormData = z.infer<typeof videoFormSchema>;

export default function AdminVideos() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState("");
  const [courseFilter, setCourseFilter] = useState<string>("ALL");
  const [publishedFilter, setPublishedFilter] = useState<"ALL" | "PUBLISHED" | "UNPUBLISHED">("ALL");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<VideoData | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingVideo, setDeletingVideo] = useState<VideoData | null>(null);

  const form = useForm<VideoFormData>({
    resolver: zodResolver(videoFormSchema),
    defaultValues: {
      courseId: "",
      title: "",
      description: "",
      externalUrl: "",
      durationSec: undefined,
      isPublished: true,
      accessStart: "",
      accessEnd: "",
    },
  });

  // Redirect if not admin
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== "ADMIN")) {
      toast({
        title: "접근 권한이 없습니다",
        description: "관리자만 접근할 수 있는 페이지입니다.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, user, toast]);

  const { data: courses = [] } = useQuery<Course[]>({
    queryKey: ["/api/admin/courses"],
    enabled: isAuthenticated && user?.role === "ADMIN",
  });

  const { data: videos = [], isLoading: videosLoading, error: videosError } = useQuery<VideoData[]>({
    queryKey: ["/api/admin/videos"],
    enabled: isAuthenticated && user?.role === "ADMIN",
  });

  // Handle videos query errors
  useEffect(() => {
    if (videosError && isUnauthorizedError(videosError as Error)) {
      toast({
        title: "인증이 필요합니다",
        description: "다시 로그인해주세요.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [videosError, toast]);

  const createMutation = useMutation({
    mutationFn: async (data: VideoFormData) => {
      const payload = {
        ...data,
        accessStart: data.accessStart ? new Date(data.accessStart).toISOString() : undefined,
        accessEnd: data.accessEnd ? new Date(data.accessEnd).toISOString() : undefined,
      };
      await apiRequest("POST", "/api/admin/videos", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/videos"] });
      toast({
        title: "동영상 생성 완료",
        description: "새로운 동영상이 성공적으로 생성되었습니다.",
      });
      closeDialog();
    },
    onError: (error) => {
      toast({
        title: "생성 실패",
        description: "동영상 생성 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<VideoFormData> }) => {
      const payload = {
        ...data,
        accessStart: data.accessStart ? new Date(data.accessStart).toISOString() : undefined,
        accessEnd: data.accessEnd ? new Date(data.accessEnd).toISOString() : undefined,
      };
      await apiRequest("PUT", `/api/admin/videos/${id}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/videos"] });
      toast({
        title: "동영상 수정 완료",
        description: "동영상이 성공적으로 수정되었습니다.",
      });
      closeDialog();
    },
    onError: (error) => {
      toast({
        title: "수정 실패",
        description: "동영상 수정 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/admin/videos/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/videos"] });
      toast({
        title: "동영상 삭제 완료",
        description: "동영상이 성공적으로 삭제되었습니다.",
      });
      setDeleteDialogOpen(false);
      setDeletingVideo(null);
    },
    onError: (error) => {
      toast({
        title: "삭제 실패",
        description: "동영상 삭제 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    },
  });

  const openCreateDialog = () => {
    setEditingVideo(null);
    form.reset();
    setDialogOpen(true);
  };

  const openEditDialog = (video: VideoData) => {
    setEditingVideo(video);
    form.reset({
      courseId: video.courseId,
      title: video.title,
      description: video.description || "",
      externalUrl: video.externalUrl,
      durationSec: video.durationSec || undefined,
      isPublished: video.isPublished,
      accessStart: video.accessStart ? new Date(video.accessStart).toISOString().slice(0, 16) : "",
      accessEnd: video.accessEnd ? new Date(video.accessEnd).toISOString().slice(0, 16) : "",
    });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingVideo(null);
    form.reset();
  };

  const openDeleteDialog = (video: VideoData) => {
    setDeletingVideo(video);
    setDeleteDialogOpen(true);
  };

  const onSubmit = (data: VideoFormData) => {
    if (editingVideo) {
      updateMutation.mutate({ id: editingVideo.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "미정";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  const getAccessStatus = (video: VideoData) => {
    const now = new Date();
    const start = video.accessStart ? new Date(video.accessStart) : null;
    const end = video.accessEnd ? new Date(video.accessEnd) : null;

    if (!video.isPublished) {
      return {
        status: "unpublished",
        label: "비공개",
        color: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
      };
    }

    if (start && now < start) {
      return {
        status: "upcoming",
        label: `공개 예정 ${start.toLocaleDateString()}`,
        color: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
      };
    }

    if (end && now > end) {
      return {
        status: "expired",
        label: "시청 기간 만료",
        color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      };
    }

    if (start && end) {
      return {
        status: "active",
        label: `OPEN ~${end.toLocaleDateString()}`,
        color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      };
    }

    return {
      status: "open",
      label: "시청 가능",
      color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    };
  };

  const filteredVideos = videos.filter(video => {
    const matchesSearch = 
      video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (video.description?.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCourse = courseFilter === "ALL" || video.courseId === courseFilter;
    
    const matchesPublished = 
      publishedFilter === "ALL" || 
      (publishedFilter === "PUBLISHED" && video.isPublished) ||
      (publishedFilter === "UNPUBLISHED" && !video.isPublished);
    
    return matchesSearch && matchesCourse && matchesPublished;
  });

  if (isLoading || !isAuthenticated || user?.role !== "ADMIN") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse">
          <div className="bg-muted h-8 rounded w-64 mb-4"></div>
          <div className="bg-muted h-32 rounded w-96"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-gradient-to-br from-primary/10 via-accent/5 to-background py-16">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-foreground mb-4">동영상 관리</h1>
            <p className="text-xl text-muted-foreground">
              강의 동영상을 등록하고 접근 기간을 설정할 수 있습니다
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {/* Actions Bar */}
        <Card className="mb-8" data-testid="card-actions">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex flex-col md:flex-row gap-4 flex-1">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="동영상 제목으로 검색..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                    data-testid="input-search"
                  />
                </div>
                
                <Select value={courseFilter} onValueChange={setCourseFilter}>
                  <SelectTrigger className="w-full md:w-48" data-testid="select-course-filter">
                    <SelectValue placeholder="강의 과정" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">모든 과정</SelectItem>
                    {courses.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={publishedFilter} onValueChange={setPublishedFilter}>
                  <SelectTrigger className="w-full md:w-32" data-testid="select-published-filter">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">전체</SelectItem>
                    <SelectItem value="PUBLISHED">공개</SelectItem>
                    <SelectItem value="UNPUBLISHED">비공개</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button onClick={openCreateDialog} data-testid="button-create">
                <Plus className="mr-2 w-4 h-4" />
                동영상 추가
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card data-testid="card-stat-total">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">전체 동영상</p>
                  <p className="text-3xl font-bold text-foreground">{videos.length}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                  <Video className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-stat-published">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">공개 동영상</p>
                  <p className="text-3xl font-bold text-foreground">
                    {videos.filter(v => v.isPublished).length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                  <Eye className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-stat-unpublished">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">비공개 동영상</p>
                  <p className="text-3xl font-bold text-foreground">
                    {videos.filter(v => !v.isPublished).length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-900 rounded-lg flex items-center justify-center">
                  <EyeOff className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-stat-filtered">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">검색 결과</p>
                  <p className="text-3xl font-bold text-foreground">{filteredVideos.length}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                  <Search className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Videos List */}
        <Card data-testid="card-videos-list">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Video className="mr-2 w-5 h-5" />
              동영상 목록
            </CardTitle>
          </CardHeader>
          <CardContent>
            {videosLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="flex items-center space-x-4 p-4 rounded-lg border border-border">
                      <div className="bg-muted w-20 h-12 rounded"></div>
                      <div className="flex-1">
                        <div className="bg-muted h-4 rounded w-64 mb-2"></div>
                        <div className="bg-muted h-3 rounded w-32"></div>
                      </div>
                      <div className="bg-muted h-8 rounded w-20"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredVideos.length === 0 ? (
              <div className="text-center py-12">
                <Video className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {searchTerm || courseFilter !== "ALL" || publishedFilter !== "ALL" 
                    ? "검색 결과가 없습니다" 
                    : "등록된 동영상이 없습니다"
                  }
                </h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || courseFilter !== "ALL" || publishedFilter !== "ALL"
                    ? "다른 조건으로 검색해보세요."
                    : "첫 번째 동영상을 추가해보세요."
                  }
                </p>
                {(!searchTerm && courseFilter === "ALL" && publishedFilter === "ALL") && (
                  <Button onClick={openCreateDialog}>
                    <Plus className="mr-2 w-4 h-4" />
                    동영상 추가하기
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredVideos.map((video) => {
                  const accessStatus = getAccessStatus(video);
                  const course = courses.find(c => c.id === video.courseId);
                  
                  return (
                    <div 
                      key={video.id} 
                      className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                      data-testid={`video-${video.id}`}
                    >
                      <div className="flex items-center space-x-4 flex-1">
                        <div className="w-20 h-12 bg-muted rounded flex items-center justify-center">
                          <Video className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground">{video.title}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm text-muted-foreground">
                              {course?.title || "알 수 없는 과정"}
                            </span>
                            <span className="text-xs text-muted-foreground">•</span>
                            <span className="text-sm text-muted-foreground flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              {formatDuration(video.durationSec)}
                            </span>
                            <span className="text-xs text-muted-foreground">•</span>
                            <span className="text-sm text-muted-foreground flex items-center">
                              <Calendar className="w-3 h-3 mr-1" />
                              {new Date(video.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        <Badge className={accessStatus.color} variant="secondary">
                          {accessStatus.label}
                        </Badge>
                        
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(video)}
                            data-testid={`button-edit-${video.id}`}
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            편집
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openDeleteDialog(video)}
                            data-testid={`button-delete-${video.id}`}
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            삭제
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={closeDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="dialog-video-form">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Video className="mr-2 w-5 h-5" />
              {editingVideo ? "동영상 편집" : "새 동영상 추가"}
            </DialogTitle>
            <DialogDescription>
              {editingVideo ? "동영상 정보를 수정하세요." : "새로운 동영상을 등록하세요."}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="courseId"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>강의 과정 *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-course">
                            <SelectValue placeholder="강의 과정을 선택하세요" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {courses.map((course) => (
                            <SelectItem key={course.id} value={course.id}>
                              {course.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>제목 *</FormLabel>
                      <FormControl>
                        <Input placeholder="동영상 제목을 입력하세요" {...field} data-testid="input-title" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>설명</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="동영상에 대한 설명을 입력하세요" 
                          rows={3}
                          {...field} 
                          data-testid="textarea-description"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="externalUrl"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>동영상 URL *</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input 
                            placeholder="https://example.com/video.mp4" 
                            className="pl-10"
                            {...field} 
                            data-testid="input-external-url"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="durationSec"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>재생 시간 (초)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="3600"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                          data-testid="input-duration"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isPublished"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormLabel>공개 상태</FormLabel>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          data-testid="switch-published"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="accessStart"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>접근 시작 시간</FormLabel>
                      <FormControl>
                        <Input 
                          type="datetime-local" 
                          {...field} 
                          data-testid="input-access-start"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="accessEnd"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>접근 종료 시간</FormLabel>
                      <FormControl>
                        <Input 
                          type="datetime-local" 
                          {...field} 
                          data-testid="input-access-end"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={closeDialog} data-testid="button-cancel">
                  <X className="mr-2 w-4 h-4" />
                  취소
                </Button>
                <Button 
                  type="submit" 
                  disabled={createMutation.isPending || updateMutation.isPending}
                  data-testid="button-save"
                >
                  <Save className="mr-2 w-4 h-4" />
                  {createMutation.isPending || updateMutation.isPending 
                    ? "저장 중..." 
                    : editingVideo ? "수정하기" : "생성하기"
                  }
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent data-testid="dialog-delete">
          <DialogHeader>
            <DialogTitle className="flex items-center text-destructive">
              <Trash2 className="mr-2 w-5 h-5" />
              동영상 삭제
            </DialogTitle>
            <DialogDescription>
              {deletingVideo && (
                <>
                  <strong>{deletingVideo.title}</strong> 동영상을 정말 삭제하시겠습니까?
                  <br />이 작업은 되돌릴 수 없습니다.
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setDeleteDialogOpen(false)}
              data-testid="button-cancel-delete"
            >
              취소
            </Button>
            <Button
              variant="destructive"
              onClick={() => deletingVideo && deleteMutation.mutate(deletingVideo.id)}
              disabled={deleteMutation.isPending}
              data-testid="button-confirm-delete"
            >
              <Trash2 className="mr-2 w-4 h-4" />
              {deleteMutation.isPending ? "삭제 중..." : "삭제하기"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
