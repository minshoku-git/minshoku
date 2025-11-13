import { Button } from "@mui/material";
import { JSX } from "react";

import { AlertType } from "@/app/_types/enum";
import { ApiResponse } from "@/app/_types/types";

type Props = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    router: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    openSnackbar: any;
}

/**
 * ログアウトボタン
 * @returns {JSX.Element} JSX
 */
export const LogoutButton = (props: Props): JSX.Element => {
    const logoutHandler = async () => {
        const response = await fetch('/api/auth/logout', {
            method: 'POST',
        });
        const res = await response.json() as ApiResponse<null>;
        if (res.success) {
            props.router.push('/login');
        } else {
            props.openSnackbar(AlertType.ERROR, res.error.message);
        }
    };

    return (
        <Button className="underline" color="inherit" onClick={() => logoutHandler()}>
            ログアウト
        </Button>
    );
};