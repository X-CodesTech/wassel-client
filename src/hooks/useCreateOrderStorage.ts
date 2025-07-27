import { useEffect, useCallback } from "react";
import { useLocation } from "wouter";

const STORAGE_KEY = "wassel_create_order_draft";
const SESSION_KEY = "wassel_create_order_session";

interface CreateOrderDraft {
  step1?: any;
  step2?: any;
  step3?: any;
  currentStep?: number;
  orderId?: string;
  timestamp: number;
}

export const useCreateOrderStorage = () => {
  const [location] = useLocation();

  // Check if we're still in the create order flow
  const isInCreateOrderFlow = location.includes("/create-order");

  // Save draft to localStorage
  const saveDraft = useCallback((data: Partial<CreateOrderDraft>) => {
    try {
      const existingDraft = localStorage.getItem(STORAGE_KEY);
      const currentDraft = existingDraft ? JSON.parse(existingDraft) : {};

      const updatedDraft: CreateOrderDraft = {
        ...currentDraft,
        ...data,
        timestamp: Date.now(),
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedDraft));

      // Set session flag to track if user is actively working on the form
      sessionStorage.setItem(SESSION_KEY, "true");
    } catch (error) {
      console.error("Failed to save draft:", error);
    }
  }, []);

  // Load draft from localStorage
  const loadDraft = useCallback((): CreateOrderDraft | null => {
    try {
      const draft = localStorage.getItem(STORAGE_KEY);
      if (!draft) return null;

      const parsedDraft = JSON.parse(draft);

      // Check if draft is still valid (less than 24 hours old)
      const isExpired =
        Date.now() - parsedDraft.timestamp > 24 * 60 * 60 * 1000;
      if (isExpired) {
        clearDraft();
        return null;
      }

      return parsedDraft;
    } catch (error) {
      console.error("Failed to load draft:", error);
      return null;
    }
  }, []);

  // Clear draft from localStorage
  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      sessionStorage.removeItem(SESSION_KEY);
    } catch (error) {
      console.error("Failed to clear draft:", error);
    }
  }, []);

  // Check if there's a saved draft
  const hasDraft = useCallback((): boolean => {
    try {
      const draft = localStorage.getItem(STORAGE_KEY);
      if (!draft) return false;

      const parsedDraft = JSON.parse(draft);
      const isExpired =
        Date.now() - parsedDraft.timestamp > 24 * 60 * 60 * 1000;

      return !isExpired;
    } catch (error) {
      return false;
    }
  }, []);

  // Auto-clear draft when navigating away from create order flow
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Clear draft when browser is closed or refreshed
      clearDraft();
    };

    const handleVisibilityChange = () => {
      // Clear draft when tab becomes hidden (user switches tabs or minimizes)
      if (document.hidden) {
        clearDraft();
      }
    };

    // Only set up listeners if we're in the create order flow
    if (isInCreateOrderFlow) {
      window.addEventListener("beforeunload", handleBeforeUnload);
      document.addEventListener("visibilitychange", handleVisibilityChange);
    }

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isInCreateOrderFlow, clearDraft]);

  // Clear draft when navigating away (but not when just refreshing)
  useEffect(() => {
    const sessionActive = sessionStorage.getItem(SESSION_KEY);

    if (!isInCreateOrderFlow && sessionActive) {
      // User navigated away from create order flow
      clearDraft();
    }
  }, [location, isInCreateOrderFlow, clearDraft]);

  return {
    saveDraft,
    loadDraft,
    clearDraft,
    hasDraft,
    isInCreateOrderFlow,
  };
};
