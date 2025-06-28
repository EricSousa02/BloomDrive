import AuthForm from "@/components/AuthForm";
import { checkUserAndRedirect } from "@/lib/actions/user.actions";

const SignUp = async () => {
  // Se já está logado, redireciona para /
  await checkUserAndRedirect();
  
  return <AuthForm type="sign-up" />;
};

export default SignUp;
