"use client";

import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export class AdminErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("[ADMIN ERROR BOUNDARY DEBUG]:", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 bg-red-50/50 border border-red-200 rounded-2xl max-w-3xl my-8 mx-auto text-left shadow-sm space-y-4">
          <div className="flex items-center gap-3 text-red-700 font-bold text-lg">
            <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0" />
            <span>Admin Interface Runtime Error</span>
          </div>

          <p className="text-sm text-red-900 leading-relaxed font-medium">
            An unexpected error occurred while rendering this section of the Admin Panel.
          </p>

          <div className="bg-white p-4 rounded-xl border border-red-100 font-mono text-xs text-red-800 overflow-x-auto">
            <p className="font-bold text-red-900 mb-1">[DEBUG REASON]: {this.state.error?.toString()}</p>
            {this.state.errorInfo?.componentStack && (
              <pre className="text-[11px] text-gray-600 mt-2 whitespace-pre-wrap">
                {this.state.errorInfo.componentStack}
              </pre>
            )}
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null, errorInfo: null });
                window.location.reload();
              }}
              className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
