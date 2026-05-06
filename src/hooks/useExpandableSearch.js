import { useEffect, useRef, useState } from "react";

export const useExpandableSearch = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [value, setValue] = useState("");
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  const open = () => {
    setIsOpen(true);
    window.setTimeout(() => inputRef.current?.focus(), 0);
  };

  const submit = () => {
    if (!isOpen) {
      open();
      return;
    }
    inputRef.current?.focus();
  };

  const clear = () => {
    setValue("");
    inputRef.current?.focus();
  };

  const closeIfEmpty = () => {
    if (value.trim()) return;
    setIsOpen(false);
  };

  useEffect(() => {
    if (!isOpen) return undefined;

    const handlePointerDown = (event) => {
      if (containerRef.current?.contains(event.target)) return;
      closeIfEmpty();
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [isOpen, value]);

  return {
    containerRef,
    inputRef,
    isOpen,
    open,
    submit,
    closeIfEmpty,
    setIsOpen,
    value,
    setValue,
    clear,
  };
};
