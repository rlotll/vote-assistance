'use client';

import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // 운영 환경 에러 수집 도구 연동 시 여기서 report
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  handleRetry = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <Card variant="default">
          <div role="alert" className="flex flex-col items-center gap-4 text-center py-2">
            <AlertCircle className="w-8 h-8 text-text-secondary" aria-hidden="true" />
            <p className="text-[length:var(--font-size-body)] text-text-primary">
              오류가 발생했습니다.
            </p>
            <Button variant="primary" onClick={this.handleRetry}>
              다시 시도
            </Button>
          </div>
        </Card>
      );
    }

    return this.props.children;
  }
}
