// src/components/ConfirmDialog/dialogService.tsx
import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { ConfirmDialog } from "./ConfirmDialog";

export function confirm(options: {
  title: string;
  description: string;
}): Promise<boolean> {
  return new Promise((resolve) => {
    const container = document.createElement("div");
    document.body.appendChild(container);

    const root = createRoot(container);

    const DialogWrapper: React.FC = () => {
      const [open, setOpen] = useState(true);

      // cleanup & resolve when closed
      const handleClose = (confirmed: boolean) => {
        setOpen(false);
        resolve(confirmed);
      };

      useEffect(() => {
        if (!open) {
          // Use setTimeout to ensure the dialog animation completes
          setTimeout(() => {
            root.unmount();
            container.remove();
          }, 100);
        }
      }, [open]);

      return (
        <ConfirmDialog
          open={open}
          title={options.title}
          description={options.description}
          onClose={handleClose}
        />
      );
    };

    root.render(<DialogWrapper />);
  });
}
