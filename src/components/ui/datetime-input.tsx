import * as React from 'react';

import { cn } from '@/lib/utils';
import { format, parse, isValid, getYear } from 'date-fns';
import { useRef, useState, useMemo, useEffect, useLayoutEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { useFormContext } from 'react-hook-form';

import { TZDate } from 'react-day-picker';
import { CalendarDotsIcon } from '@phosphor-icons/react';

type DateTimeInputProps = {
  className?: string;
  value?: Date;
  onChange?: (date?: Date) => void;
  format?: string;
  disabled?: boolean;
  clearable?: boolean;
  timezone?: string;
  hideCalendarIcon?: boolean;
  onCalendarClick?: () => void;
  error?: boolean;
};

// https://date-fns.org/v4.1.0/docs/format
type SegmentType = 'year' | 'month' | 'date' | 'hour' | 'minute' | 'second' | 'period' | 'space';

const segmentConfigs = [
  {
    type: 'year' as SegmentType,
    symbols: ['y'],
  },
  {
    type: 'month' as SegmentType,
    symbols: ['M'],
  },
  {
    type: 'date' as SegmentType,
    symbols: ['d'],
  },
  {
    type: 'hour' as SegmentType,
    symbols: ['h', 'H'],
  },
  {
    type: 'minute' as SegmentType,
    symbols: ['m'],
  },
  {
    type: 'second' as SegmentType,
    symbols: ['s'],
  },
  {
    type: 'period' as SegmentType,
    symbols: ['a'],
  },
  {
    type: 'space' as SegmentType,
    symbols: [' ', '/', '-', ':', ',', '.'],
  },
];
/* eslint-disable @typescript-eslint/no-explicit-any */
const mergeRefs = (...refs: (React.MutableRefObject<any> | React.RefCallback<any> | null | undefined)[]) => {
  return (node: any) => {
    for (const ref of refs) {
      if (!ref) continue;
      if (typeof ref === 'function') {
        ref(node);
      } else {
        ref.current = node;
      }
    }
  };
};
const DateTimeInput = React.forwardRef<HTMLInputElement, DateTimeInputProps>((options: DateTimeInputProps, ref) => {
  const { format: formatProp, value: _value, timezone, onChange, ...rest } = options;
  const value = useMemo(() => _value ? new TZDate(_value, timezone) : undefined, [_value, timezone]);
  const form = useFormContext();
  const formatStr = React.useMemo(() => formatProp || 'dd/MM/yyyy-hh:mm aa', [formatProp]);
  const inputRef = useRef<HTMLInputElement>(null);

  const [segments, setSegments] = useState<Segment[]>([]);
  const [selectedSegmentAt, setSelectedSegmentAt] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (form?.formState.isSubmitted) {
      setSegments(parseFormat(formatStr, value));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form?.formState.isSubmitted]);
  useEffect(() => {
    // console.error('valueChanged', {formatStr, inputStr, value});
    setSegments(parseFormat(formatStr, value));
  }, [formatStr, value]);

  const curSegment = useMemo(() => {
    if (selectedSegmentAt === undefined || selectedSegmentAt < 0 || selectedSegmentAt >= segments.length)
      return undefined;
    return segments[selectedSegmentAt];
  }, [segments, selectedSegmentAt]);
  const setCurrentSegment = useCallback(
    (segment: Segment | undefined) => {
      const at = segments?.findIndex((s) => s.index === segment?.index);
      if (at !== -1) setSelectedSegmentAt(at);
    },
    [segments, setSelectedSegmentAt]
  );

  const validSegments = useMemo(() => segments.filter((s) => s.type !== 'space'), [segments]);
  const inputStr = useMemo(() => {
    return segments.map((s) => (s.value ? s.value.padStart(s.symbols.length, '0') : s.symbols)).join('');
  }, [segments]);
  const areAllSegmentsEmpty = useMemo(() => validSegments.every((s) => !s.value), [validSegments]);

  const inputValue = useMemo(() => {
    const allHasValue = !validSegments.some((s) => !s.value);
    if (!allHasValue) return undefined;
    const date = parse(inputStr, formatStr, value || new TZDate(new Date(), timezone));
    const year = getYear(date);
    // console.log('inputValue', {allHasValue, validSegments, inputStr, formatStr, date, year});
    if (isValid(date) && year > 1000 && year <= 9999) {
      return date;
    }
    return undefined;
  }, [validSegments, inputStr, formatStr, value, timezone]);

  useEffect(() => {
    if (!inputValue) return;
    if (value?.getTime() !== inputValue.getTime()) {
      // console.log('inputValueChanged', {formatStr, inputStr, value, inputValue, });
      onChange?.(inputValue);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputValue]);


  const onClick = useEventCallback(
    (event: React.MouseEvent<HTMLInputElement>) => {
      event.preventDefault();
      event.stopPropagation();
      const selectionStart = inputRef.current?.selectionStart;
      if (inputRef.current && selectionStart !== undefined && selectionStart !== null) {
        const validSegments = segments.filter((s) => s.type !== 'space');
        let segment = validSegments.find(
          (s) => s.index <= selectionStart && s.index + s.symbols.length >= selectionStart
        );
        if (!segment) segment = [...validSegments].reverse().find((s) => s.index <= selectionStart);
        if (!segment) segment = validSegments.find((s) => s.index >= selectionStart);
        setCurrentSegment(segment);
        setSelection(inputRef, segment);
      }
    },
    [segments, setCurrentSegment]
  );

  const onSegmentChange = useEventCallback(
    (direction: 'left' | 'right') => {
      if (!curSegment) return;
      const validSegments = segments.filter((s) => s.type !== 'space');
      const segment =
        direction === 'left'
          ? [...validSegments].reverse().find((s) => s.index < curSegment.index)
          : validSegments.find((s) => s.index > curSegment.index);
      if (segment) {
        setCurrentSegment(segment);
        setSelection(inputRef, segment);
      }
    },
    [segments, curSegment, setCurrentSegment]
  );

  const onSegmentNumberValueChange = useEventCallback(
    (num: string) => {
      if (!curSegment) return;
      let segment = curSegment;
      let shouldNext = false;
      if (segment.type !== 'period') {
        const length = segment.symbols.length;
        const rawValue = parseInt(segment.value).toString();
        let newValue = rawValue.length < length ? rawValue + num : num;
        let parsedDate = parse(newValue.padStart(length, '0'), segment.symbols, safeDate(timezone));
        if (!isValid(parsedDate) && newValue.length > 1) {
          newValue = num;
          parsedDate = parse(newValue, segment.symbols, safeDate(timezone));
        }
        const updatedSegments = segments.map((s) => (s.index === segment.index ? { ...segment, value: newValue } : s));
        setSegments(updatedSegments);
        segment = updatedSegments.find((s) => s.index === segment.index)!;
        shouldNext = newValue.length === length;
        if (!shouldNext) {
          switch (segment.type) {
            case 'month':
              shouldNext = +newValue > 1;
              break;
            case 'date':
              shouldNext = +newValue > 3;
              break;
            case 'hour':
              shouldNext = +newValue > (segment.symbols.includes('H') ? 2 : 1);
              break;
            case 'minute':
            case 'second':
              shouldNext = +newValue > 5;
              break;
            default:
              break;
          }
        }
      }
      if (shouldNext) {
        onSegmentChange('right');
      } else {
        setSelection(inputRef, segment);
      }
    },
    [segments, curSegment, timezone, onSegmentChange]
  );

  const onSegmentPeriodValueChange = useEventCallback(
    (key: string) => {
      if (curSegment?.type !== 'period') return;
      let segment = curSegment;
      let ok = false;
      let newValue = '';
      if (key?.toLowerCase() === 'a') {
        newValue = 'AM';
        ok = true;
      } else if (key?.toLowerCase() === 'p') {
        newValue = 'PM';
        ok = true;
      }
      if (ok) {
        const updatedSegments = segments.map((s) => (s.index === segment.index ? { ...segment, value: newValue } : s));
        setSegments(updatedSegments);
        segment = updatedSegments.find((s) => s.index === segment.index)!;
      }
      setSelection(inputRef, segment);
    },
    [segments, curSegment]
  );

  const onSegmentValueRemove = useEventCallback(() => {
    if (!curSegment) return;
    if (curSegment.value) {
      const updatedSegments = segments.map((s) => (s.index === curSegment.index ? { ...curSegment, value: '' } : s));
      setSegments(updatedSegments);
      const segment = updatedSegments.find((s) => s.index === curSegment.index)!;
      setSelection(inputRef, segment);
    } else {
      onSegmentChange('left');
    }
  }, [segments, curSegment, onSegmentChange]);

  const onKeyDown = useEventCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
    const key = event.key;
    setSelection(inputRef, curSegment);

    switch (key) {
      case 'ArrowRight':
      case 'ArrowLeft':
        onSegmentChange(key === 'ArrowRight' ? 'right' : 'left');
        event.preventDefault();
        break;
      // case 'ArrowUp':
      // case 'ArrowDown':
      //   // onSegmentValueChange?.(event);
      //   event.preventDefault();
      //   break;
      case 'Backspace':
        onSegmentValueRemove();
        event.preventDefault();
        break;

      case key.match(/\d/)?.input:
        onSegmentNumberValueChange(key);
        event.preventDefault();
        break;
      case key.match(/[a-z]/)?.[0]:
        onSegmentPeriodValueChange(key);
        event.preventDefault();
        break;
    }
  }, [curSegment, onSegmentChange, onSegmentNumberValueChange, onSegmentPeriodValueChange, onSegmentValueRemove]);

  const [isFocused, setIsFocused] = useState(false);
  const hasError = !inputValue && !areAllSegmentsEmpty;

  // Get form field error state if available
  let formError = false;
  try {
    const formContext = form;
    if (formContext) {
      formError = formContext.formState.isSubmitted && !inputValue;
    }
  } catch {
    // Not inside a form context
  }

  const showError = options.error || hasError || formError;

  return (
    <div className={options.className}>
      <div
        ref={ref}
        className={cn(
          'flex h-13 w-full min-w-0 items-center justify-start rounded-md border bg-white ps-3 pe-1 text-base shadow-xs transition-[color,box-shadow] outline-none md:text-md',
          'border-input',
          'placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground',
          'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
          isFocused && !showError && 'border-ring ring-ring/50 ring-[3px]',
          showError && 'ring-destructive/20 dark:ring-destructive/40 border-destructive',
          options.hideCalendarIcon && 'pe-3'
        )}
      >
        <input
          ref={mergeRefs(inputRef)}
          className={cn("grow min-w-0 bg-transparent py-1 pe-2 md:text-sm focus:outline-none disabled:cursor-not-allowed disabled:opacity-50", inputValue ? "text-foreground" : "text-foreground")}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onClick={onClick}
          onKeyDown={onKeyDown}
          value={inputStr}
          placeholder={formatStr}
          onChange={() => { }}
          disabled={options.disabled}
          spellCheck={false}
          {...rest}
        />

        {!options.hideCalendarIcon && (
          <Button type="button" variant="ghost" size="icon" onClick={options.onCalendarClick}>
            <CalendarDotsIcon weight='duotone' className="size-5 text-muted-foreground" />
          </Button>
        )}
      </div>
      {/* Error Message Below */}
      {hasError ? (
        <div className="text-red-500 text-xs flex items-center gap-1 font-medium mt-1">
          <span>Invalid date time</span>
        </div>
      ) : null}
    </div>
  );
});

DateTimeInput.displayName = 'DateTimeInput';

export { DateTimeInput };

interface Segment {
  type: SegmentType;
  symbols: string;
  index: number;
  value: string;
}
function parseFormat(formatStr: string, value?: Date) {
  const views: Segment[] = [];
  let lastPattern: SegmentType | '' = '';
  let symbols = '';
  let patternIndex = 0;
  let index = 0;
  for (const c of formatStr) {
    const pattern = segmentConfigs.find((p) => p.symbols.includes(c))!;
    if (!pattern) continue;
    if (pattern.type !== lastPattern) {
      if (symbols) {
        views.push({
          type: lastPattern as SegmentType,
          symbols,
          index: patternIndex,
          value: value ? format(value, symbols) : '',
        });
      }
      lastPattern = pattern?.type || '';
      symbols = c;
      patternIndex = index;
    } else {
      symbols += c;
    }
    index++;
  }
  if (symbols) {
    views.push({
      type: lastPattern as SegmentType,
      symbols,
      index: patternIndex,
      value: value ? format(value, symbols) : '',
    });
  }
  return views;
}

const safeDate = (timezone?: string) => {
  return new TZDate('2000-01-01T00:00:00', timezone);
};

const isAndroid = () => /Android/i.test(navigator.userAgent);

function setSelection(ref: React.RefObject<HTMLInputElement | null>, segment?: Segment) {
  if (!ref.current || !segment) return;
  safeSetSelection(ref.current, segment.index, segment.index + segment.symbols.length);
}

function safeSetSelection(element: HTMLInputElement, selectionStart: number, selectionEnd: number) {
  requestAnimationFrame(() => {
    if (document.activeElement === element) {
      if (isAndroid()) {
        requestAnimationFrame(() => {
          element.setSelectionRange(selectionStart, selectionEnd, 'none');
        });
      } else {
        element.setSelectionRange(selectionStart, selectionEnd, 'none');
      }
    }
  });
}
/* eslint-disable @typescript-eslint/no-explicit-any */
export function useEventCallback<T extends (...args: any[]) => any>(fn: T, deps: React.DependencyList) {
  const ref = useRef(fn);
  useIsomorphicLayoutEffect(() => {
    ref.current = fn;
  });
  return useCallback((...args: Parameters<T>) => {
    return ref.current?.(...args);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

export const useIsomorphicLayoutEffect = typeof document !== 'undefined' ? useLayoutEffect : useEffect;