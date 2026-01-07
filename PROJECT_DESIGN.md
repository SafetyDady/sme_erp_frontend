# Project Design: Smart ERP Frontend

## Design Philosophy: Corporate Glass (Light)
This project adopts a "Corporate Glass" design language, balancing modern aesthetics with enterprise-grade readability.

### Core Principles
1.  **Readability First**: High contrast text, subtle backgrounds, and clear hierarchy.
2.  **Subtle Depth**: Uses soft shadows and thin borders instead of heavy drop shadows.
3.  **Glassmorphism**: Applied lightly to sticky elements (Sidebar, TopBar) to maintain context without distraction.
4.  **Compact Density**: Optimized for 1366x768 screens to maximize data visibility without clutter.

### Color Palette
-   **Primary**: Blue (`blue-600`, `blue-50`)
-   **Neutral**: Slate (`slate-50` to `slate-900`)
-   **Feedback**: Red (Error), Green (Success), Amber (Warning)

### Typography
-   **Font Family**: Inter (via Tailwind default sans)
-   **Scale**:
    -   H1: `text-2xl font-bold`
    -   H2: `text-xl font-semibold`
    -   Body: `text-sm` (Default for data)
    -   Caption: `text-xs text-slate-500`

## Layout Structure
The application uses a responsive sidebar layout:
-   **Sidebar**: Fixed left, collapsible (256px -> 64px).
-   **TopBar**: Fixed top, sticky, glass effect.
-   **Main Content**: Fluid width, padded, scrollable independently.

## Component Architecture
-   `src/components/layout/`: Core layout components (`AppLayout`, `Sidebar`, `TopBar`).
-   `src/components/common/`: Reusable UI elements (Buttons, Cards, Inputs).
-   `src/pages/`: Page-level components.
