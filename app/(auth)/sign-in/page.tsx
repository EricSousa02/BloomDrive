import AuthForm from "@/components/AuthForm";
import { checkUserAndRedirect } from "@/lib/actions/user.actions";

const SignIn = async () => {
  // Se já está logado, redireciona para /
  await checkUserAndRedirect();
  
  return <AuthForm type="sign-in" />;
};

export default SignIn;
