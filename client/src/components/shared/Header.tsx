import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useTheme } from "./ThemeProvider";
import { GraduationCap, Menu, X, Moon, Sun, User, LogOut, UserPlus } from "lucide-react";
import { hardStudentLogout } from "@/lib/api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";

// Auth form schemas
const loginSchema = z.object({
  email: z.string().email("올바른 이메일 주소를 입력해주세요"),
  password: z.string().min(1, "비밀번호를 입력해주세요"),
});

const signupSchema = z.object({
  email: z.string().email("올바른 이메일 주소를 입력해주세요"),
  firstName: z.string().min(1, "이름을 입력해주세요"),
  lastName: z.string().min(1, "성을 입력해주세요"),
  password: z.string().min(6, "비밀번호는 최소 6자 이상이어야 합니다"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "비밀번호가 일치하지 않습니다",
  path: ["confirmPassword"],
});

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [showSignupDialog, setShowSignupDialog] = useState(false);
  const [password, setPassword] = useState("");
  const { user, isAuthenticated, isLoading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [location, setLocation] = useLocation();
  const { toast } = useToast();

  // Form handlers
  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const signupForm = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: "",
      firstName: "",
      lastName: "",
      password: "",
      confirmPassword: "",
    },
  });

  // Login mutation with role-based redirect
  const loginMutation = useMutation({
    mutationFn: async (values: z.infer<typeof loginSchema>) => {
      const response = await apiRequest("POST", "/api/auth/login", values);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "로그인 성공",
        description: `환영합니다, ${data.user.firstName}님!`,
      });
      setShowLoginDialog(false);
      loginForm.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      
      // 역할별 리다이렉트 (지침 1번)
      setTimeout(() => {
        if (data.user.role === 'ADMIN') {
          setLocation('/admin-dashboard'); // 🎯 통합: 관리자는 /admin-dashboard로
        } else {
          setLocation('/'); // 일반회원은 항상 랜딩으로
        }
      }, 500);
    },
    onError: (error) => {
      toast({
        title: "로그인 실패",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Signup mutation
  const signupMutation = useMutation({
    mutationFn: async (values: z.infer<typeof signupSchema>) => {
      const response = await apiRequest("POST", "/api/auth/signup", values);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "회원가입 성공",
        description: data.message,
      });
      setShowSignupDialog(false);
      signupForm.reset();
    },
    onError: (error) => {
      toast({
        title: "회원가입 실패",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // 🎯 관리자용 로그아웃 (가이드 2) 
  const hardAdminLogout = async () => {
    try { 
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' }); 
    } catch {}
    
    // ① 폴링/구독 중지 (AbortController 사용했다면 abort)
    window.dispatchEvent(new Event("admin:stopPolling"));

    // ② 상태 초기화
    localStorage.removeItem('auth_user');
    sessionStorage.removeItem('auth_user');
    localStorage.clear();
    sessionStorage.clear();
    queryClient.clear();

    // ③ 홈으로 이동
    setLocation('/');

    // ④ 서버 상태 재확인(무음)
    await fetch('/api/auth/user', { credentials: 'include', cache: 'no-store' });
  };

  // 🎯 역할별 로그아웃 함수 선택
  const performLogout = async () => {
    if (user?.role === 'ADMIN') {
      await hardAdminLogout();
    } else {
      // 학생/일반 사용자는 hardStudentLogout 사용
      await hardStudentLogout(() => setLocation('/'));
    }
    
    // 🎯 로그아웃 후 TanStack Query 캐시 완전 정리
    queryClient.clear(); // 모든 캐시 정리로 충분
  };

  const logoutMutation = useMutation({
    mutationFn: performLogout,
    onSuccess: () => {
      toast({
        title: "로그아웃 완료",
        description: "안전하게 로그아웃되었습니다.",
      });
    },
    onError: (error) => {
      toast({
        title: "로그아웃 실패", 
        description: "다시 시도해주세요.",
        variant: "destructive",
      });
      console.error('Logout failed:', error);
    },
  });

  const handleLogin = (values: z.infer<typeof loginSchema>) => {
    loginMutation.mutate(values);
  };

  const handleSignup = (values: z.infer<typeof signupSchema>) => {
    signupMutation.mutate(values);
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const scrollToAbout = () => {
    const aboutSection = document.getElementById('about');
    if (aboutSection) {
      aboutSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // 🎯 강의 버튼용 프로그램 섹션으로 스크롤
  const scrollToPrograms = () => {
    const programsSection = document.getElementById('programs');
    if (programsSection) {
      programsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // 🎯 갤러리 버튼용 갤러리 섹션으로 스크롤  
  const scrollToGallery = () => {
    const gallerySection = document.getElementById('gallery');
    if (gallerySection) {
      gallerySection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const navItems = [
    { href: "/", label: "홈" },
    { action: scrollToAbout, label: "원장 소개" },
    { action: scrollToPrograms, label: "강의" },
    { href: "/videos", label: "동영상" },
    { action: scrollToGallery, label: "갤러리" },
  ];

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "671321") {
      window.location.href = "/admin";
    } else {
      alert("잘못된 비밀번호입니다.");
    }
    setPassword("");
    setShowPasswordDialog(false);
  };

  const handleSpecialClick = () => {
    setShowPasswordDialog(true);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-200";
      case "VERIFIED":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "PENDING":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "관리자";
      case "VERIFIED":
        return "인증 회원";
      case "PENDING":
        return "승인 대기";
      default:
        return role;
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-background/80 navbar-blur border-b border-border">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-[#FF6B00] rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white font-black text-sm">시</span>
            </div>
            <div>
              <h1 className="text-lg font-black text-foreground leading-tight">시대영재 학원</h1>
              <p className="text-[10px] text-muted-foreground leading-tight">중고등부 입시영어 전문</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item, index) => (
              item.href ? (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-foreground hover:text-primary transition-colors ${
                    location === item.href ? "text-primary" : ""
                  }`}
                >
                  {item.label}
                </Link>
              ) : (
                <button
                  key={`action-${index}`}
                  onClick={item.action}
                  className="text-foreground hover:text-primary transition-colors cursor-pointer"
                >
                  {item.label}
                </button>
              )
            ))}
          </div>

          {/* Auth Buttons & Controls */}
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="hidden md:flex"
            >
              {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </Button>

            {!isLoading && (
              <>
                {isAuthenticated && user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="flex items-center space-x-2 p-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={(user as any)?.profileImageUrl || undefined} />
                          <AvatarFallback>
                            {(user as any)?.firstName?.[0] || (user as any)?.email?.[0] || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="hidden sm:block text-left">
                          <p className="text-sm font-medium">
                            {(user as any)?.firstName || (user as any)?.email}
                          </p>
                          <Badge
                            className={`text-xs ${getRoleBadgeColor((user as any)?.role || "")}`}
                            variant="secondary"
                          >
                            {getRoleLabel((user as any)?.role || "")}
                          </Badge>
                        </div>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuItem asChild>
                        <Link href="/account" className="flex items-center">
                          <User className="mr-2 h-4 w-4" />
                          내 계정
                        </Link>
                      </DropdownMenuItem>
                      {(user as any)?.role === "ADMIN" && (
                        <DropdownMenuItem asChild>
                          <Link href="/admin" className="flex items-center">
                            <GraduationCap className="mr-2 h-4 w-4" />
                            관리자 대시보드
                          </Link>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={handleLogout}
                        className="flex items-center cursor-pointer"
                        data-testid="button-logout"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        로그아웃
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <>
                    <Button 
                      variant="ghost" 
                      onClick={() => setShowLoginDialog(true)}
                      data-testid="button-login"
                    >
                      로그인
                    </Button>
                    <Button 
                      onClick={() => setShowSignupDialog(true)}
                      data-testid="button-signup"
                    >
                      회원가입
                    </Button>
                  </>
                )}
              </>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X /> : <Menu />}
            </Button>
          </div>
        </div>

        {/* Password Dialog */}
        <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>관리자 접속</DialogTitle>
            </DialogHeader>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <Input
                type="password"
                placeholder="비밀번호를 입력하세요"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
                data-testid="input-admin-password"
              />
              <div className="flex gap-2 justify-end">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setShowPasswordDialog(false);
                    setPassword("");
                  }}
                >
                  취소
                </Button>
                <Button type="submit" data-testid="button-admin-login">
                  확인
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Login Dialog */}
        <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>로그인</DialogTitle>
            </DialogHeader>
            <Form {...loginForm}>
              <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                <FormField
                  control={loginForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>이메일</FormLabel>
                      <FormControl>
                        <Input 
                          type="email" 
                          placeholder="이메일을 입력하세요" 
                          {...field} 
                          data-testid="input-login-email"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={loginForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>비밀번호</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="비밀번호를 입력하세요" 
                          {...field} 
                          data-testid="input-login-password"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex gap-2 justify-end">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setShowLoginDialog(false);
                      loginForm.reset();
                    }}
                  >
                    취소
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={loginMutation.isPending}
                    data-testid="button-submit-login"
                  >
                    {loginMutation.isPending ? "로그인 중..." : "로그인"}
                  </Button>
                </div>
                <div className="text-center">
                  <Button
                    type="button"
                    variant="link"
                    onClick={() => {
                      setShowLoginDialog(false);
                      setShowSignupDialog(true);
                    }}
                    className="text-sm"
                  >
                    계정이 없으신가요? 회원가입
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Signup Dialog */}
        <Dialog open={showSignupDialog} onOpenChange={setShowSignupDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>회원가입</DialogTitle>
            </DialogHeader>
            <Form {...signupForm}>
              <form onSubmit={signupForm.handleSubmit(handleSignup)} className="space-y-4">
                <FormField
                  control={signupForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>이메일</FormLabel>
                      <FormControl>
                        <Input 
                          type="email" 
                          placeholder="이메일을 입력하세요" 
                          {...field} 
                          data-testid="input-signup-email"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={signupForm.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>성</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="성" 
                            {...field} 
                            data-testid="input-signup-lastname"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={signupForm.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>이름</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="이름" 
                            {...field} 
                            data-testid="input-signup-firstname"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={signupForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>비밀번호</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="비밀번호 (최소 6자)" 
                          {...field} 
                          data-testid="input-signup-password"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={signupForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>비밀번호 확인</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="비밀번호를 다시 입력하세요" 
                          {...field} 
                          data-testid="input-signup-confirm-password"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex gap-2 justify-end">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setShowSignupDialog(false);
                      signupForm.reset();
                    }}
                  >
                    취소
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={signupMutation.isPending}
                    data-testid="button-submit-signup"
                  >
                    {signupMutation.isPending ? "가입 중..." : "회원가입"}
                  </Button>
                </div>
                <div className="text-center">
                  <Button
                    type="button"
                    variant="link"
                    onClick={() => {
                      setShowSignupDialog(false);
                      setShowLoginDialog(true);
                    }}
                    className="text-sm"
                  >
                    이미 계정이 있으신가요? 로그인
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 py-4 border-t border-border">
            <div className="flex flex-col space-y-3">
              {navItems.map((item, index) => (
                item.href ? (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="py-2 text-foreground hover:text-primary transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ) : (
                  <button
                    key={`mobile-action-${index}`}
                    onClick={() => {
                      item.action?.();
                      setMobileMenuOpen(false);
                    }}
                    className="py-2 text-foreground hover:text-primary transition-colors text-left cursor-pointer"
                  >
                    {item.label}
                  </button>
                )
              ))}
              <div className="pt-3 border-t border-border">
                <Button
                  variant="ghost"
                  onClick={toggleTheme}
                  className="w-full justify-start"
                >
                  {theme === "light" ? <Moon className="mr-2 h-4 w-4" /> : <Sun className="mr-2 h-4 w-4" />}
                  {theme === "light" ? "다크 모드" : "라이트 모드"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
