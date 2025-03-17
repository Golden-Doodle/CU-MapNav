import { useState, useEffect } from "react";

interface UseSearchProps<T> {
  data: T[];
  searchKey: keyof T;
  debounceTime?: number;
  returnDataOnEmptyQuery?: boolean;
}

const useSearch = <T extends {}>({
  data,
  searchKey,
  debounceTime = 100,
  returnDataOnEmptyQuery = false,
}: UseSearchProps<T>) => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filteredData, setFilteredData] = useState<T[]>([]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredData(returnDataOnEmptyQuery ? data : []);
      return;
    }

    const timeout = setTimeout(() => {
      // Filter data based on the search query
      const results = data.filter((item) =>
        String(item[searchKey]).toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredData(results);
    }, debounceTime); // Debounce time

    return () => clearTimeout(timeout);
  }, [searchQuery, data, searchKey, debounceTime, returnDataOnEmptyQuery]);

  return {
    searchQuery,
    setSearchQuery,
    filteredData,
  };
};

export default useSearch;
