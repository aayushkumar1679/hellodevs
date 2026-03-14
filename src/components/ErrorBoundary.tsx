"use client";

import React from "react";

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  componentName?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * ErrorBoundary — catches render errors in any child subtree.
 *
 * Usage:
 *   <ErrorBoundary componentName="Canvas">
 *     <Canvas />
 *   </ErrorBoundary>
 *
 * Or with a custom fallback:
 *   <ErrorBoundary fallback={<p>Custom error UI</p>}>
 *     <Canvas />
 *   </ErrorBoundary>
 */
export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error(
      `[ErrorBoundary${this.props.componentName ? ` · ${this.props.componentName}` : ""}]`,
      error,
      info.componentStack
    );
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div
          className="flex flex-col items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 p-8 text-center"
          style={{ minHeight: 160 }}
        >
          <div className="mb-3 text-3xl">💥</div>
          <p className="text-sm font-bold text-rose-700">
            {this.props.componentName
              ? `${this.props.componentName} crashed`
              : "Something went wrong"}
          </p>
          <p className="mt-1 max-w-xs text-xs text-rose-500">
            {this.state.error?.message ?? "An unexpected render error occurred."}
          </p>
          <button
            onClick={this.handleReset}
            className="mt-4 rounded-full border border-rose-300 bg-white px-4 py-1.5 text-xs font-bold text-rose-600 transition hover:bg-rose-100"
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * withErrorBoundary — HOC to wrap any component with an ErrorBoundary.
 *
 * Usage:
 *   const SafeCanvas = withErrorBoundary(Canvas, "Canvas");
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  componentName?: string
) {
  const Wrapped = (props: P) => (
    <ErrorBoundary componentName={componentName}>
      <Component {...props} />
    </ErrorBoundary>
  );
  Wrapped.displayName = `WithErrorBoundary(${componentName ?? Component.displayName ?? Component.name})`;
  return Wrapped;
}

export default ErrorBoundary;
