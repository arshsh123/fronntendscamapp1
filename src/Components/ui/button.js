import { jsx as _jsx } from "react/jsx-runtime";
export function Button({ className = "", ...props }) {
    return (_jsx("button", { className: "inline-flex items-center justify-center rounded-xl px-4 py-3 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50 " +
            className, ...props }));
}
export default Button;
