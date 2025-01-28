import Image from "@tiptap/extension-image";

export const ResizableImage = Image.extend({
  name: "resizableImage",
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        renderHTML: (attributes) => ({
          width: attributes.width,
        }),
      },
      alignment: {
        default: "left",
      },
    };
  },
  addNodeView() {
    return ({ node, getPos, editor }) => {
      const container = document.createElement("div");
      container.classList.add("image-resizer");

      const img = document.createElement("img");
      img.src = node.attrs.src;
      img.className = node.attrs.class || "";
      if (node.attrs.width) {
        img.style.width = node.attrs.width;
      }

      // Prevent dragging on the image
      img.draggable = false;

      // Apply alignment
      if (node.attrs.alignment === "center") {
        container.style.margin = "0 auto";
        container.style.display = "block";
      } else {
        if (node.attrs.alignment === "left") {
          container.style.margin = "0";
        } else if (node.attrs.alignment === "right") {
          container.style.marginLeft = "auto";
          container.style.display = "block";
        }
      }

      const handle = document.createElement("div");
      handle.classList.add("resize-handle");

      // Add alignment controls
      const alignmentControls = document.createElement("div");
      alignmentControls.classList.add("alignment-controls");

      ["left", "center", "right"].forEach((alignment) => {
        const button = document.createElement("button");
        button.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          ${
            alignment === "left"
              ? '<path d="M21 6H3M15 12H3M17 18H3"/>'
              : alignment === "center"
              ? '<path d="M21 6H3M18 12H6M21 18H3"/>'
              : '<path d="M21 6H3M21 12H9M21 18H3"/>'
          }
        </svg>`;
        button.classList.add("alignment-button");
        if (node.attrs.alignment === alignment) {
          button.classList.add("active");
        }
        button.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          if (typeof getPos === "function") {
            editor.commands.command(({ tr }) => {
              tr.setNodeMarkup(getPos(), undefined, {
                ...node.attrs,
                alignment,
              });
              return true;
            });
          }
        });
        alignmentControls.appendChild(button);
      });

      container.append(img);
      container.append(handle);
      container.append(alignmentControls);

      let startX: number;
      let startWidth: number;
      let isDragging = false;

      const onMouseDown = (e: MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        startX = e.pageX;
        startWidth = img.offsetWidth;
        isDragging = true;

        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
      };

      const onMouseMove = (e: MouseEvent) => {
        if (!isDragging) return;

        e.preventDefault();
        e.stopPropagation();

        const currentX = e.pageX;
        const diff = currentX - startX;
        const newWidth = Math.max(100, startWidth + diff);
        img.style.width = `${newWidth}px`;
      };

      const onMouseUp = (e: MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        isDragging = false;
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);

        if (typeof getPos === "function") {
          editor.commands.command(({ tr }) => {
            tr.setNodeMarkup(getPos(), undefined, {
              ...node.attrs,
              width: img.style.width,
            });
            return true;
          });
        }
      };

      // Prevent dragging on the container
      container.addEventListener("dragstart", (e) => {
        e.preventDefault();
        e.stopPropagation();
      });

      handle.addEventListener("mousedown", onMouseDown);

      return {
        dom: container,
        destroy: () => {
          handle.removeEventListener("mousedown", onMouseDown);
          container.removeEventListener("dragstart", (e) => {
            e.preventDefault();
            e.stopPropagation();
          });
        },
      };
    };
  },
});
