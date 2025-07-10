import React from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Search from "@/components/Search";
import FileUploader from "@/components/FileUploader";
import { SimpleThemeToggle } from "@/components/SimpleThemeToggle";
import { signOutUser, forceLogout } from "@/lib/actions/user.actions";

const Header = ({
  userId,
  accountId,
}: {
  userId: string;
  accountId: string;
}) => {
  return (
    <header className="header">
      <Search />
      <div className="header-wrapper">
        <FileUploader ownerId={userId} accountId={accountId} />
        <SimpleThemeToggle />
        
        {/* Botão temporário para forçar logout */}
        <form
          action={async () => {
            "use server";
            await forceLogout();
          }}
        >
          <Button type="submit" className="sign-out-button" variant="outline" size="sm">
            Forçar Logout
          </Button>
        </form>
        
        <form
          action={async () => {
            "use server";
            await signOutUser();
          }}
        >
          <Button type="submit" className="sign-out-button">
            <Image
              src="/assets/icons/logout.svg"
              alt="logo"
              width={24}
              height={24}
              className="w-6"
            />
          </Button>
        </form>
      </div>
    </header>
  );
};
export default Header;
