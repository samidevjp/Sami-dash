'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import {
  X,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';

const tutorialSteps = [
  {
    title: 'Welcome to Wabi!',
    description: "Let's get you started with setting up your business.",
    action: 'Click "Next Step" to begin setting up your restaurant.',
    path: '/dashboard',
    validation: () => true, // Always valid for welcome step
    highlightSelector: ''
  },
  {
    title: 'Receive Payments',
    description: 'Set up your payment processing to start accepting payments.',
    action: 'Complete your payment onboarding at Wabi.',
    path: '/dashboard',
    highlightSelector: '',
    validation: async (token: string) => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}get_business_profile`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        const data = await response.json();
        console.log(data);
        return data?.data?.business_profile.stripe_account_id !== null;
      } catch {
        return false;
      }
    },
    onStepAction: () => {
      console.log('onStepAction');
      window.open('https://onboard.wabify.net/', '_blank');
    }
  },
  {
    title: 'Menu Setup',
    description: 'Add your menu items and categories.',
    action: 'Add at least one menu item and category in your inventory.',
    path: '/dashboard/inventory',
    highlightSelector:
      '[data-tutorial="create-product"], [data-tutorial="create-category"]',
    validation: async (token: string) => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}pos/product/menu`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        const data = await response.json();
        console.log(data);
        return data?.data?.menu?.length > 0;
      } catch {
        return false;
      }
    }
  },
  {
    title: 'Table Layout',
    description: "Configure your restaurant's floor plan.",
    action: 'Create at least one table in your layout.',
    path: '/dashboard',
    highlightSelector: '',
    validation: async (token: string) => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}get_floors`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        const data = await response.json();
        console.log(data);
        return data?.data?.floors?.length > 0;
      } catch {
        return false;
      }
    }
  },
  {
    title: 'Team Members',
    description: 'Add your staff and set their permissions.',
    action: 'Add at least one team member to your staff.',
    path: '/dashboard/team',
    highlightSelector: '[data-tutorial="create-employee"]',
    validation: async (token: string) => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}get_employees`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        const data = await response.json();
        return data?.data?.employees?.length > 1;
      } catch {
        return false;
      }
    }
  }
];

export function TutorialSidebar() {
  const { data: session } = useSession();
  const [isVisible, setIsVisible] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [stepValidation, setStepValidation] = useState<boolean | null>(null);
  const [hasInitialized, setHasInitialized] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Add the styles
  useTutorialStyles();

  // Initialize from localStorage or session only once
  useEffect(() => {
    if (!hasInitialized && session?.user) {
      const savedStep = localStorage.getItem('tutorialStep');
      const isTutorialComplete = session.user.tutorial_complete === 1;

      if (isTutorialComplete) {
        setIsVisible(false);
        setIsMinimized(false);
        localStorage.removeItem('tutorialStep');
      } else {
        setIsVisible(true);
        setIsMinimized(false);
        // Use localStorage if available, otherwise use session
        setCurrentStep(
          savedStep ? parseInt(savedStep) : session.user.tutorial_step || 0
        );
        // Initialize localStorage if not set
        if (!savedStep) {
          localStorage.setItem(
            'tutorialStep',
            (session.user.tutorial_step || 0).toString()
          );
        }
      }
      setHasInitialized(true);
    }
  }, [session?.user, hasInitialized]);

  // Handle logout
  useEffect(() => {
    if (!session?.user) {
      localStorage.removeItem('tutorialStep');
      setHasInitialized(false);
      setIsVisible(false);
      setIsMinimized(false);
    }
  }, [session]);

  // Hide tutorial on pin page
  useEffect(() => {
    if (
      pathname === '/pin' ||
      pathname === '/signup' ||
      pathname === '/upgrade-plan'
    ) {
      setIsVisible(false);
      setIsMinimized(false);
    } else if (hasInitialized && !session?.user?.tutorial_complete) {
      setIsVisible(true);
      setIsMinimized(false);
    }
  }, [pathname, hasInitialized, session?.user?.tutorial_complete]);

  // Update localStorage when step changes
  useEffect(() => {
    if (hasInitialized && !session?.user?.tutorial_complete) {
      localStorage.setItem('tutorialStep', currentStep.toString());
    }
  }, [currentStep, hasInitialized, session?.user?.tutorial_complete]);

  // Validate current step
  useEffect(() => {
    const validateCurrentStep = async () => {
      if (!session?.user?.token || currentStep === 0) return;

      setStepValidation(null); // Reset validation while checking
      const isValid = await tutorialSteps[currentStep].validation(
        session.user.token
      );
      setStepValidation(isValid);
    };

    validateCurrentStep();
  }, [currentStep, session?.user?.token]);

  const handleClose = () => {
    setIsVisible(false);
    setIsMinimized(true);
  };

  // Don't render anything if tutorial is complete
  if (session?.user?.tutorial_complete === 1) return null;

  // Don't render if neither visible nor minimized
  if (!isVisible && !isMinimized) return null;

  const isLastStep = currentStep === tutorialSteps.length - 1;

  const handleUpdateTutorial = async (
    nextStep: number,
    complete: boolean = false
  ) => {
    if (!session?.user?.id || isLoading) return;

    // For steps after welcome, validate before proceeding
    if (currentStep > 0 && !stepValidation) {
      router.push(tutorialSteps[currentStep].path);
      setIsVisible(false);
      setIsMinimized(true);
      return;
    }

    setIsLoading(true);
    try {
      // Update local state first
      setCurrentStep(nextStep);
      setStepValidation(null);

      if (complete) {
        setIsVisible(false);
        setIsMinimized(false);
        localStorage.removeItem('tutorialStep');
        // Only update session on completion
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}user/update-tutorial`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session?.user?.token}`
          },
          body: JSON.stringify({
            user_id: session.user.id,
            tutorial_step: nextStep,
            tutorial_complete: complete
          })
        });
      } else {
        router.push(tutorialSteps[nextStep].path);
      }
    } catch (error) {
      console.error('Error updating tutorial status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Show highlight if tutorial exists (visible or minimized) and we have a selector */}
      {(isVisible || isMinimized) &&
        tutorialSteps[currentStep].highlightSelector && (
          <TutorialHighlight
            selector={tutorialSteps[currentStep].highlightSelector}
          />
        )}
      {isVisible && (
        <div className="fixed right-0 top-0 z-[9999] flex h-screen w-80 flex-col border-l bg-background p-6 shadow-lg">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold text-foreground">
              Tutorial Guide
            </h2>
            <button
              onClick={handleClose}
              className="rounded-full p-2 text-foreground hover:bg-accent/50"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-grow space-y-6 overflow-y-auto">
            {tutorialSteps.map((step, index) => {
              const isCurrentStep = index === currentStep;
              const isCompleted = index < currentStep;

              return (
                <div
                  key={index}
                  className={`rounded-lg border p-4 ${
                    isCurrentStep
                      ? 'border-foreground bg-accent/10'
                      : isCompleted
                      ? 'border-border bg-background'
                      : 'border-border bg-background opacity-50'
                  }`}
                >
                  <div className="mb-1 flex items-center justify-between">
                    <h3 className="font-semibold text-foreground">
                      {step.title}
                    </h3>
                    {isCompleted && (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {step.description}
                  </p>
                  {isCurrentStep && (
                    <>
                      <div className="mt-2 text-sm font-medium text-foreground">
                        {step.action}
                      </div>
                      {stepValidation !== null && currentStep > 0 && (
                        <div
                          className={`mt-2 flex items-center gap-2 text-sm ${
                            stepValidation ? 'text-green-500' : 'text-danger'
                          }`}
                        >
                          {stepValidation ? (
                            <>
                              <CheckCircle2 className="h-4 w-4" />
                              Ready to continue!
                            </>
                          ) : (
                            <>
                              <AlertCircle className="h-4 w-4" />
                              Complete this step to continue
                            </>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-6 border-t pt-4">
            <button
              onClick={() => {
                // Execute onStepAction if it exists for the current step
                if (
                  currentStep > 0 &&
                  !stepValidation &&
                  typeof tutorialSteps[currentStep]?.onStepAction === 'function'
                ) {
                  tutorialSteps[currentStep]?.onStepAction?.();
                }

                isLastStep
                  ? handleUpdateTutorial(currentStep, true)
                  : handleUpdateTutorial(currentStep + 1);
              }}
              disabled={isLoading}
              className={`flex w-full items-center justify-center gap-2 rounded-lg p-3 font-medium transition-colors
                ${
                  isLoading
                    ? 'cursor-not-allowed bg-accent/50'
                    : currentStep > 0 && !stepValidation
                    ? 'bg-black hover:opacity-80'
                    : 'bg-primary hover:bg-green-600'
                } 
                text-primary-foreground`}
            >
              {isLoading ? (
                'Updating...'
              ) : currentStep > 0 && !stepValidation ? (
                'Go to Step'
              ) : isLastStep ? (
                'Finish Tutorial'
              ) : (
                <>
                  Next Step
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}
      {isMinimized && (
        <div className="fixed bottom-6 right-6 z-[9999]">
          <button
            onClick={() => {
              setIsMinimized(false);
              setIsVisible(true);
            }}
            className="group flex items-center gap-0 rounded-full bg-primary p-4 text-primary-foreground shadow-lg transition-all duration-200 hover:gap-2 hover:bg-primary/90"
          >
            <BookOpen size={24} />
            <span className=" max-w-0 overflow-hidden whitespace-nowrap transition-all duration-200 group-hover:inline group-hover:max-w-xs">
              Continue Tutorial
            </span>
          </button>
        </div>
      )}
    </>
  );
}

function TutorialHighlight({ selector }: { selector: string }) {
  useEffect(() => {
    const element = document.querySelector(selector) as HTMLElement;
    if (element) {
      const originalPosition = element.style.position;
      const originalZIndex = element.style.zIndex;

      element.style.position = 'relative';
      element.style.zIndex = '10001'; // Higher than the sidebar
      element.classList.add('tutorial-highlight');

      return () => {
        element.style.position = originalPosition;
        element.style.zIndex = originalZIndex;
        element.classList.remove('tutorial-highlight');
      };
    }
  }, [selector]);

  return null;
}

// Move styles to a client-side effect
function useTutorialStyles() {
  useEffect(() => {
    const styleEl = document.createElement('style');
    styleEl.textContent = `
      .tutorial-highlight {
        position: relative;
      }
      
      .tutorial-highlight::after {
        content: '';
        position: absolute;
        top: -4px;
        left: -4px;
        right: -4px;
        bottom: -4px;
        border: 2px solid #0ea5e9;
        border-radius: 8px;
        animation: pulse 2s infinite;
        pointer-events: none;
        z-index: 10002; /* Higher than both the sidebar and the element */
      }
      
      @keyframes pulse {
        0% {
          box-shadow: 0 0 0 0 rgba(14, 165, 233, 0.4);
        }
        70% {
          box-shadow: 0 0 0 10px rgba(14, 165, 233, 0);
        }
        100% {
          box-shadow: 0 0 0 0 rgba(14, 165, 233, 0);
        }
      }
    `;
    document.head.appendChild(styleEl);

    return () => {
      document.head.removeChild(styleEl);
    };
  }, []);
}
