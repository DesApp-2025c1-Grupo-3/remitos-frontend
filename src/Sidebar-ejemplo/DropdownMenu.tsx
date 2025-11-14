import { useRef, useState } from "react";
import OptionMenu from "./OptionMenu";
import { Tooltip } from "@mui/material";

interface DropdownMenuProps {
    isCollapsed: boolean;
    IconComponent: React.FC<{color?: string, className?: string}>;
    title: string;
    items: { src: React.FC<{color?: string}>, title: string, link?: string }[];
    onClick: () => void;
    isOpen: boolean;
    onToggle: () => void;
}

export default function DropdownMenu({ IconComponent, title, items, isCollapsed, onClick, isOpen, onToggle }: DropdownMenuProps) {

    const textRef = useRef<HTMLParagraphElement>(null);
    
    const isLocationSection = items.some(item => window.location.pathname.includes(item.link || "")) || (title === "Inicio" && window.location.pathname === "/");

    
    const commonClasses = `
        flex items-center h-14 rounded-lg overflow-hidden
        transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
        w-full px-4
        ${isLocationSection && !isOpen
        ? "bg-menu-hover text-primary-orange"
        : "hover:bg-menu-hover text-gray-600"}
        
    `;

    if (title === "Inicio") {
        return (
            <OptionMenu 
                IconComponent={IconComponent}
                onClick={onClick}
                title={title}
                isCollapsed={isCollapsed}
                commonClasses={`${commonClasses} sidebar-item cursor-pointer`}
                link={""}
            />
        );
    }

    return (
        <div className="flex flex-col w-full">
            <Tooltip title={isCollapsed ? title : ""} placement="right" arrow>
                <div className={`${commonClasses} sidebar-item cursor-pointer`} onClick={onToggle}>
                    <div className={`flex items-center ${!isCollapsed && "gap-4"} w-full`}>
                        <IconComponent color={isLocationSection && !isOpen ? "#E65F2B" : "#5A5A65"} className="mx-auto size-8"/>
                        <p
                            ref={textRef}
                            className={`
                            text-sm whitespace-nowrap
                            transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
                            ${isCollapsed ? "opacity-0 translate-x-[-10px] w-0" : "opacity-100 translate-x-0 w-full"}
                            `}
                        >
                            {title}
                        </p>
                    </div>
                </div>
            </Tooltip>
    
            <ul className={` w-full overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
                ${isOpen ? 'max-h-96' : 'max-h-0'} flex flex-col gap-1
            `}>
                {items.map((item, index) => (
                    <OptionMenu 
                        key={index} 
                        IconComponent={item.src}
                        title={item.title}
                        isCollapsed={isCollapsed}
                        link={item.link}
                        onClick={onClick}
                        isSubmenu={true}
                    />
                ))}
            </ul>
        </div>
    );
}