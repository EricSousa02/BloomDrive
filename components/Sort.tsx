"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { sortTypes } from "@/constants";
import { useEffect, useState } from "react";

const Sort = () => {
  const path = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentSort, setCurrentSort] = useState<string>("");

  // Define o valor atual do sort baseado na URL
  useEffect(() => {
    const sortParam = searchParams.get("sort");
    setCurrentSort(sortParam || "$updatedAt-desc");
  }, [searchParams]);

  const handleSort = (value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("sort", value);
    router.push(`${path}?${params.toString()}`);
  };

  // Encontra o label correspondente ao valor atual
  const getCurrentSortLabel = () => {
    const sortType = sortTypes.find(sort => sort.value === currentSort);
    return sortType ? sortType.label : "Recentes";
  };

  // Não renderiza até que o sort atual seja definido para evitar hidratação
  if (!currentSort) {
    return (
      <div className="sort-select">
        <div className="sort-select-trigger">
          <span>Recentes</span>
        </div>
      </div>
    );
  }

  return (
    <Select onValueChange={handleSort} value={currentSort}>
      <SelectTrigger className="sort-select">
        <SelectValue placeholder="Recentes">
          {getCurrentSortLabel()}
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="sort-select-content">
        {sortTypes.map((sort) => (
          <SelectItem
            key={sort.label}
            className="shad-select-item"
            value={sort.value}
          >
            {sort.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default Sort;
