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
  BookOpen, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Tag,
  Calendar,
  GripVertical,
  Save,
  X,
  Video,
  Eye
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Link } from "wouter";

interface Course {
  id: string;
  title: string;
  slug: string;
  description?: string;
  thumbnail?: string;
  tags: string[];
  order: number;
  createdAt: string;
  updatedAt: string;
}

const courseFormSchema = z.object({
  title: z.string().min(1, "제목을 입력해주세요"),
  slug: z.string().min(1, "슬러그를 입력해주세요").regex(/^[a-z0-9-]+$/, "소문자, 숫자, 하이픈만 사용 가능합니다"),
  description: z.string().optional(),
  thumbnail: z.string().url("올바른 URL을 입력해주세요").optional().or(z.literal("")),
  tags: z.string(),
  order: z.number().min(0, "순서는 0 이상이어야 합니다"),
});

type CourseFormData = z.infer<typeof courseFormSchema>;

export default function AdminCourses() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingCourse, setDeletingCourse] = useState<Course | null>(null);

  const form = useForm<CourseFormData>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: {
      title: "",
      slug: "",
      description: "",
      thumbnail: "",
      tags: "",
      order: 0,
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

  const { data: courses = [], isLoading: coursesLoading, error: coursesError } = useQuery<Course[]>({
    queryKey: ["/api/admin/courses"],
    enabled: isAuthenticated && user?.role === "ADMIN",
  });

  // Handle courses query errors
  useEffect(() => {
    if (coursesError && isUnauthorizedError(coursesError as Error)) {
      toast({
        title: "인증이 필요합니다",
        description: "다시 로그인해주세요.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [coursesError, toast]);

  const createMutation = useMutation({
    mutationFn: async (data: CourseFormData) => {
      const payload = {
        ...data,
        tags: data.tags.split(",").map(tag => tag.trim()).filter(tag => tag.length > 0),
      };
      await apiRequest("POST", "/api/admin/courses", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/courses"] });
      toast({
        title: "강의 생성 완료",
        description: "새로운 강의가 성공적으로 생성되었습니다.",
      });
      closeDialog();
    },
    onError: (error) => {
      toast({
        title: "생성 실패",
        description: "강의 생성 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: CourseFormData }) => {
      const payload = {
        ...data,
        tags: data.tags.split(",").map(tag => tag.trim()).filter(tag => tag.length > 0),
      };
      await apiRequest("PUT", `/api/admin/courses/${id}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/courses"] });
      toast({
        title: "강의 수정 완료",
        description: "강의가 성공적으로 수정되었습니다.",
      });
      closeDialog();
    },
    onError: (error) => {
      toast({
        title: "수정 실패",
        description: "강의 수정 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/admin/courses/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/courses"] });
      toast({
        title: "강의 삭제 완료",
        description: "강의가 성공적으로 삭제되었습니다.",
      });
      setDeleteDialogOpen(false);
      setDeletingCourse(null);
    },
    onError: (error) => {
      toast({
        title: "삭제 실패",
        description: "강의 삭제 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    },
  });

  const openCreateDialog = () => {
    setEditingCourse(null);
    form.reset({
      title: "",
      slug: "",
      description: "",
      thumbnail: "",
      tags: "",
      order: courses.length,
    });
    setDialogOpen(true);
  };

  const openEditDialog = (course: Course) => {
    setEditingCourse(course);
    form.reset({
      title: course.title,
      slug: course.slug,
      description: course.description || "",
      thumbnail: course.thumbnail || "",
      tags: course.tags.join(", "),
      order: course.order,
    });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingCourse(null);
    form.reset();
  };

  const openDeleteDialog = (course: Course) => {
    setDeletingCourse(course);
    setDeleteDialogOpen(true);
  };

  const onSubmit = (data: CourseFormData) => {
    if (editingCourse) {
      updateMutation.mutate({ id: editingCourse.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  // Auto-generate slug from title
  const watchTitle = form.watch("title");
  useEffect(() => {
    if (watchTitle && !editingCourse) {
      const slug = watchTitle
        .toLowerCase()
        .replace(/[^a-z0-9가-힣\s]/g, "")
        .replace(/\s+/g, "-")
        .replace(/[가-힣]/g, (char) => {
          // Simple romanization for Korean characters
          const koreanToRoman: { [key: string]: string } = {
            "토익": "toeic",
            "비즈니스": "business",
            "영어": "english",
            "회화": "conversation",
            "문법": "grammar",
            "리스닝": "listening",
            "리딩": "reading",
            "스피킹": "speaking",
            "라이팅": "writing",
          };
          return koreanToRoman[char] || char;
        })
        .substring(0, 50);
      form.setValue("slug", slug);
    }
  }, [watchTitle, editingCourse, form]);

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
            <h1 className="text-4xl font-bold text-foreground mb-4">강의 관리</h1>
            <p className="text-xl text-muted-foreground">
              강의 과정을 생성하고 정렬할 수 있습니다
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {/* Actions Bar */}
        <Card className="mb-8" data-testid="card-actions">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="강의 제목, 설명, 태그로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  data-testid="input-search"
                />
              </div>
              
              <Button onClick={openCreateDialog} data-testid="button-create">
                <Plus className="mr-2 w-4 h-4" />
                강의 추가
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card data-testid="card-stat-total">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">전체 강의</p>
                  <p className="text-3xl font-bold text-foreground">{courses.length}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-stat-filtered">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">검색 결과</p>
                  <p className="text-3xl font-bold text-foreground">{filteredCourses.length}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                  <Search className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-stat-tags">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">사용된 태그</p>
                  <p className="text-3xl font-bold text-foreground">
                    {new Set(courses.flatMap(course => course.tags)).size}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                  <Tag className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Courses List */}
        <Card data-testid="card-courses-list">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BookOpen className="mr-2 w-5 h-5" />
              강의 목록
            </CardTitle>
          </CardHeader>
          <CardContent>
            {coursesLoading ? (
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
            ) : filteredCourses.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {searchTerm ? "검색 결과가 없습니다" : "등록된 강의가 없습니다"}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm ? "다른 키워드로 검색해보세요." : "첫 번째 강의를 추가해보세요."}
                </p>
                {!searchTerm && (
                  <Button onClick={openCreateDialog}>
                    <Plus className="mr-2 w-4 h-4" />
                    강의 추가하기
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredCourses.map((course) => (
                  <div 
                    key={course.id} 
                    className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                    data-testid={`course-${course.id}`}
                  >
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="flex items-center cursor-grab">
                        <GripVertical className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium text-muted-foreground ml-2 w-8">
                          {course.order}
                        </span>
                      </div>
                      
                      <div className="w-20 h-12 bg-muted rounded flex items-center justify-center overflow-hidden">
                        {course.thumbnail ? (
                          <img 
                            src={course.thumbnail} 
                            alt={course.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <BookOpen className="w-6 h-6 text-muted-foreground" />
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">{course.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {course.description || "설명이 없습니다"}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex flex-wrap gap-1">
                            {course.tags.slice(0, 3).map((tag, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {course.tags.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{course.tags.length - 3}
                              </Badge>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            {new Date(course.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        data-testid={`button-view-${course.id}`}
                      >
                        <Link href={`/courses/${course.id}`}>
                          <Eye className="w-4 h-4 mr-1" />
                          보기
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(course)}
                        data-testid={`button-edit-${course.id}`}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        편집
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openDeleteDialog(course)}
                        data-testid={`button-delete-${course.id}`}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        삭제
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={closeDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="dialog-course-form">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <BookOpen className="mr-2 w-5 h-5" />
              {editingCourse ? "강의 편집" : "새 강의 추가"}
            </DialogTitle>
            <DialogDescription>
              {editingCourse ? "강의 정보를 수정하세요." : "새로운 강의를 등록하세요."}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>제목 *</FormLabel>
                      <FormControl>
                        <Input placeholder="강의 제목을 입력하세요" {...field} data-testid="input-title" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>슬러그 *</FormLabel>
                      <FormControl>
                        <Input placeholder="url-friendly-slug" {...field} data-testid="input-slug" />
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
                          placeholder="강의에 대한 설명을 입력하세요" 
                          rows={4}
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
                  name="thumbnail"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>썸네일 URL</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="https://example.com/thumbnail.jpg" 
                          {...field} 
                          data-testid="input-thumbnail"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tags"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>태그</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="토익, 비즈니스, 영어회화 (쉼표로 구분)" 
                          {...field} 
                          data-testid="input-tags"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="order"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>순서</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="0"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          data-testid="input-order"
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
                    : editingCourse ? "수정하기" : "생성하기"
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
              강의 삭제
            </DialogTitle>
            <DialogDescription>
              {deletingCourse && (
                <>
                  <strong>{deletingCourse.title}</strong> 강의를 정말 삭제하시겠습니까?
                  <br />이 강의에 포함된 모든 동영상도 함께 삭제됩니다.
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
              onClick={() => deletingCourse && deleteMutation.mutate(deletingCourse.id)}
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
