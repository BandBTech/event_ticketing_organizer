"use client";

import { useState, useEffect, useRef, useCallback } from "react";

/**
 * useDebounce - Returns a debounced version of the provided value
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds (default: 300ms)
 * @returns The debounced value
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
	const [debouncedValue, setDebouncedValue] = useState<T>(value);

	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedValue(value);
		}, delay);

		return () => {
			clearTimeout(timer);
		};
	}, [value, delay]);

	return debouncedValue;
}

/**
 * useDebouncedCallback - Returns a debounced version of the provided callback
 * @param callback - The callback function to debounce
 * @param delay - Delay in milliseconds (default: 300ms)
 * @returns The debounced callback function
 */
export function useDebouncedCallback<T extends (...args: unknown[]) => unknown>(
	callback: T,
	delay: number = 300
): (...args: Parameters<T>) => void {
	const callbackRef = useRef(callback);
	const timeoutRef = useRef<NodeJS.Timeout | null>(null);

	// Update callback ref when callback changes
	useEffect(() => {
		callbackRef.current = callback;
	}, [callback]);

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}
		};
	}, []);

	return useCallback(
		(...args: Parameters<T>) => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}

			timeoutRef.current = setTimeout(() => {
				callbackRef.current(...args);
			}, delay);
		},
		[delay]
	);
}

/**
 * useDebouncedState - Combines useState with debouncing
 * Returns both immediate value (for input) and debounced value (for API calls)
 * @param initialValue - Initial state value
 * @param delay - Delay in milliseconds (default: 300ms)
 * @returns [immediateValue, debouncedValue, setImmediateValue]
 */
export function useDebouncedState<T>(
	initialValue: T,
	delay: number = 300
): [T, T, React.Dispatch<React.SetStateAction<T>>] {
	const [value, setValue] = useState<T>(initialValue);
	const debouncedValue = useDebounce(value, delay);

	return [value, debouncedValue, setValue];
}
