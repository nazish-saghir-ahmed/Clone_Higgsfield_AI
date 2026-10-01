"use client";

import React, { useState, useEffect } from "react";
import { Key, Globe, Check, AlertTriangle, Eye, EyeOff, X, RefreshCw } from "lucide-react";
import { getApiKey, setApiKey, getGatewayUrl, setGatewayUrl, DEFAULT_GATEWAY_URL } from "@/lib/storage";
import axios from "axios";

interface BYOKAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

export const BYOKAuthModal: React.FC<BYOKAuthModalProps> = ({ isOpen, onClose, onSaved }) => {
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [gatewayUrlInput, setGatewayUrlInput] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testStatus, setTestStatus] = useState<"idle" | "success" | "error">("idle");
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    if (isOpen) {
      setApiKeyInput(getApiKey());
      setGatewayUrlInput(getGatewayUrl());
      setTestStatus("idle");
      setStatusMessage("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    setApiKey(apiKeyInput.trim());
    setGatewayUrl(gatewayUrlInput.trim() || DEFAULT_GATEWAY_URL);
    onSaved?.();
    onClose();
  };

  const handleTestConnection = async () => {
    const keyToTest = apiKeyInput.trim();
    const urlToTest = gatewayUrlInput.trim() || DEFAULT_GATEWAY_URL;

    if (!keyToTest) {
      setTestStatus("error");
      setStatusMessage("Please enter an API key to test connection.");
      return;
    }

    setIsTesting(true);
    setTestStatus("idle");
    setStatusMessage("");

    try {
      // Test gateway connectivity
      await axios.get(`${urlToTest}/api/v1/health`, {
        headers: { "x-api-key": keyToTest },
        timeout: 5000,
      });
      setTestStatus("success");
      setStatusMessage("Successfully authenticated with neural gateway!");
    } catch (err: any) {
      // Even if /health doesn't exist, if status is not 401, server is reachable
      if (err.response?.status === 401) {
        setTestStatus("error");
        setStatusMessage("Authentication failed: HTTP 401 Unauthorized.");
      } else if (err.code === "ECONNABORTED" || err.message?.includes("Network Error")) {
        setTestStatus("error");
        setStatusMessage(`Gateway unreachable at ${urlToTest}. Check URL or network.`);
      } else {
        setTestStatus("success");
        setStatusMessage("Gateway reached and active!");
      }
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg p-6 overflow-hidden rounded-2xl bg-[#0f111a]/95 border border-white/10 shadow-2xl backdrop-blur-2xl">
        {/* Glow accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent-cyan via-accent-indigo to-accent-lime" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-accent-cyan/10 text-accent-cyan">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white font-display">Gateway Credentials</h3>
              <p className="text-xs text-slate-400">Bring Your Own Key (BYOK) - Stored locally</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 rounded-lg hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="space-y-4">
          {/* API Key Input */}
          <div>
            <label className="block mb-1.5 text-xs font-medium text-slate-300">
              Inference API Key (<code className="text-accent-cyan font-mono text-[11px]">x-api-key</code>)
            </label>
            <div className="relative">
              <input
                type={showKey ? "text" : "password"}
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder="Enter your API Key (e.g. mu_live_...)"
                className="w-full px-3.5 py-2.5 pr-10 text-sm font-mono text-white bg-black/40 border border-white/10 rounded-xl focus:outline-none focus:border-accent-cyan focus:ring-1 focus:ring-accent-cyan/40 transition-all placeholder:text-slate-600"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="mt-1 text-[11px] text-slate-500">
              Keys are never transmitted to any third-party telemetry.
            </p>
          </div>

          {/* Gateway Endpoint Override */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-accent-indigo" /> Gateway Host URL
              </label>
              {gatewayUrlInput !== DEFAULT_GATEWAY_URL && (
                <button
                  type="button"
                  onClick={() => setGatewayUrlInput(DEFAULT_GATEWAY_URL)}
                  className="text-[11px] text-accent-cyan hover:underline"
                >
                  Reset Default
                </button>
              )}
            </div>
            <input
              type="text"
              value={gatewayUrlInput}
              onChange={(e) => setGatewayUrlInput(e.target.value)}
              placeholder={DEFAULT_GATEWAY_URL}
              className="w-full px-3.5 py-2.5 text-sm font-mono text-white bg-black/40 border border-white/10 rounded-xl focus:outline-none focus:border-accent-cyan focus:ring-1 focus:ring-accent-cyan/40 transition-all placeholder:text-slate-600"
            />
          </div>

          {/* Status Message */}
          {testStatus !== "idle" && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center gap-2 border ${
                testStatus === "success"
                  ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                  : "bg-red-500/10 text-red-300 border-red-500/20"
              }`}
            >
              {testStatus === "success" ? (
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
              )}
              <span>{statusMessage}</span>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between pt-4 mt-6 border-t border-white/5">
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={isTesting || !apiKeyInput.trim()}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-300 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:text-white transition-all disabled:opacity-50 disabled:pointer-events-none"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? "animate-spin text-accent-cyan" : ""}`} />
            {isTesting ? "Verifying..." : "Test Connection"}
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 text-xs font-semibold text-black bg-gradient-to-r from-accent-cyan to-accent-lime rounded-xl hover:shadow-[0_0_20px_rgba(0,219,233,0.4)] transition-all active:scale-[0.98]"
            >
              Save Credentials
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
