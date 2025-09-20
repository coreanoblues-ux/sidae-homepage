import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import { User, LogIn, UserPlus, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

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

export default function Login() {
  const [isSignup, setIsSignup] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // 이미 로그인된 경우 리다이렉트
  if (isAuthenticated) {
    if ((user as any)?.role === 'ADMIN') {
      setLocation('/admin');
    } else {
      setLocation('/');
    }
    return null;
  }

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
      loginForm.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      
      // 역할별 리다이렉트
      if (data.user.role === 'ADMIN') {
        setLocation('/admin');
      } else {
        setLocation('/');
      }
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
      signupForm.reset();
      setIsSignup(false); // 로그인 폼으로 전환
    },
    onError: (error) => {
      toast({
        title: "회원가입 실패",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleLogin = (values: z.infer<typeof loginSchema>) => {
    loginMutation.mutate(values);
  };

  const handleSignup = (values: z.infer<typeof signupSchema>) => {
    signupMutation.mutate(values);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
              {isSignup ? <UserPlus className="h-6 w-6 text-primary-foreground" /> : <LogIn className="h-6 w-6 text-primary-foreground" />}
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">
            {isSignup ? "회원가입" : "로그인"}
          </CardTitle>
          <p className="text-muted-foreground">
            {isSignup ? "시대영재 학원에 가입하세요" : "시대영재 학원에 로그인하세요"}
          </p>
        </CardHeader>
        
        <CardContent>
          {!isSignup ? (
            // 로그인 폼
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
                
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={loginMutation.isPending}
                  data-testid="button-submit-login"
                >
                  {loginMutation.isPending ? "로그인 중..." : "로그인"}
                </Button>
                
                <div className="text-center">
                  <Button
                    type="button"
                    variant="link"
                    onClick={() => setIsSignup(true)}
                    className="text-sm"
                  >
                    계정이 없으신가요? 회원가입
                  </Button>
                </div>
              </form>
            </Form>
          ) : (
            // 회원가입 폼
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
                
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={signupMutation.isPending}
                  data-testid="button-submit-signup"
                >
                  {signupMutation.isPending ? "가입 중..." : "회원가입"}
                </Button>
                
                <div className="text-center">
                  <Button
                    type="button"
                    variant="link"
                    onClick={() => setIsSignup(false)}
                    className="text-sm"
                  >
                    이미 계정이 있으신가요? 로그인
                  </Button>
                </div>
              </form>
            </Form>
          )}
          
          {/* 메인으로 돌아가기 버튼 */}
          <div className="mt-6 text-center">
            <Button variant="ghost" asChild>
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                메인으로 돌아가기
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}