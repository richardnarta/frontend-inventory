import { SidebarTrigger, useSidebar } from "./ui/sidebar";
import { Button } from "@/components/ui/button";

interface PageHeadingProps {
    headingTitle: string;
    actionButtonTitle?: string;
    actionButtonIcon?: React.ReactNode;
    actionButton: () => void
}

export const PageHeading = ({
    headingTitle,
    actionButtonTitle,
    actionButtonIcon,
    actionButton
}: PageHeadingProps) => {
    const { isMobile } = useSidebar();

    return (
        <div className="flex items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
                {isMobile ? <SidebarTrigger /> : undefined}
                <h1 className="text-2xl font-bold tracking-tight">
                    {headingTitle}
                </h1>
            </div>

            {actionButtonTitle && actionButton && (
                <Button
                    onClick={actionButton}
                    className="flex items-center gap-4 bg-blue-500 font-semibold hover:bg-blue-600"
                >
                    {actionButtonIcon}
                    <span>{actionButtonTitle}</span>
                </Button>
            )}
        </div>
    )
}