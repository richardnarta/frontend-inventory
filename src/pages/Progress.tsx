import { PageHeading } from '@/components/PageHeading';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

interface ProgressProps {
    name: string
}

export const ProgressPage = ({ name }: ProgressProps) => {
    return (
        <div className="flex flex-col h-full gap-8">
            <PageHeading headingTitle={name} actionButton={() => {}} />

            {/* 2. Content wrapper: Grows to fill remaining space and centers its content. */}
            <div className="flex flex-1 flex-col items-center justify-center w-full gap-8">
                {/* Lottie Animation Player */}
                <div className="w-84 h-84">
                    <DotLottieReact
                        src="working.lottie"
                        loop
                        autoplay
                    />
                </div>

                {/* The Text Below */}
                <h2 className="text-3xl font-bold text-muted-foreground">
                    Page is on progress...
                </h2>
            </div>
        </div>
    );
};