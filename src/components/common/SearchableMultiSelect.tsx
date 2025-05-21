import React, { useState, useEffect, useCallback, useRef } from 'react'
import {
  Autocomplete,
  TextField,
  Chip,
  Box,
  styled,
  AutocompleteRenderGetTagProps,
  Paper,
  PaperProps,
  CircularProgress
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { UseFormRegister, FieldError, Path, PathValue, FieldValues, Merge, UseFormSetValue } from 'react-hook-form'
import { UseQueryResult } from '@tanstack/react-query'
import { AxiosResponse } from 'axios'

interface Option {
  id: number
  [key: string]: any
}

type HookFunction = (
  pageSize: number,
  page: number,
  searchQuery?: string
) => UseQueryResult<AxiosResponse<any, any>, Error>

interface SearchableMultiSelectProps<TFormValues extends FieldValues> {
  options: Option[] | HookFunction
  onChange?: (selectedIds: number | number[] | string | null) => void
  value?: number | number[] | string
  labelKey?: string
  name: Path<TFormValues>
  label?: string
  defaultValue?: number | number[] | string
  error?: boolean
  disabled?: boolean
  required?: boolean
  register?: UseFormRegister<TFormValues>
  setValue?: UseFormSetValue<TFormValues>
  className?: string
  fieldError?: Merge<FieldError, (FieldError | undefined)[]> | undefined
  multiple?: boolean
  returnAsArray?: boolean
  returnAsString?: boolean
  selectedOptionsList?: Option[]
  showAsterisk?: boolean
  defaultOption?: Option
  searchDebounceTime?: number
}

const StyledChip = styled(Chip)(({ theme }) => ({
  margin: '2px',
  '& .MuiChip-deleteIcon': {
    color: theme.palette.grey[500],
    '&:hover': {
      color: theme.palette.grey[700]
    }
  }
}))

const StyledPaper = styled(Paper)({
  maxHeight: '300px',
  overflowY: 'auto',
  '& .MuiAutocomplete-listbox': {
    maxHeight: 'none',
    overflow: 'visible'
  },
  '&::-webkit-scrollbar': {
    width: '8px'
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: '#bdbdbd',
    borderRadius: '4px'
  },
  '&::-webkit-scrollbar-track': {
    backgroundColor: '#f5f5f5'
  }
})

const CustomPaper = (props: PaperProps) => {
  return <StyledPaper {...props} />
}

const SearchableMultiSelect = <TFormValues extends FieldValues>({
  options,
  onChange,
  value,
  labelKey,
  name,
  defaultValue,
  error,
  disabled,
  required,
  register,
  setValue,
  className,
  fieldError,
  label,
  multiple,
  returnAsArray,
  returnAsString,
  selectedOptionsList,
  showAsterisk,
  defaultOption,
  searchDebounceTime = 500
}: SearchableMultiSelectProps<TFormValues>) => {
  const getInitialValue = (val: number | number[] | string | undefined): number[] => {
    if (!val) return []
    if (Array.isArray(val)) return val
    const value = [Number(val)]
    return value
  }

  const [selectedIds, setSelectedIds] = useState<number[]>(getInitialValue(value))
  const [optionsData, setOptionsData] = useState<Option[]>(defaultOption ? [defaultOption] : [])
  const [selectedOptionsData, setSelectedOptionsData] = useState<Option[]>(defaultOption ? [defaultOption] : [])
  const [page, setPage] = useState(1)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [totalItems, setTotalItems] = useState(0)
  const [open, setOpen] = useState(false)
  const PAGE_SIZE = 10
  const [searchQuery, setSearchQuery] = useState('')
  const searchTimeoutRef = useRef<NodeJS.Timeout>()
  const [isSearching, setIsSearching] = useState(false)

  const debouncedSearch = useCallback(
    (query: string) => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
      searchTimeoutRef.current = setTimeout(() => {
        setSearchQuery(query)
        setPage(1)
        setOptionsData([])
        setHasMore(true)
        setIsSearching(false)
      }, searchDebounceTime)
    },
    [searchDebounceTime]
  )

  const handleSearchChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const newSearchQuery = event.target.value
      setIsSearching(true)
      debouncedSearch(newSearchQuery)
    },
    [debouncedSearch]
  )

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [])

  const hookResult = typeof options === 'function' ? (options as HookFunction)(PAGE_SIZE, page, searchQuery) : null

  useEffect(() => {
    if (typeof options === 'function' && (open || (Array.isArray(value) ? value.length > 0 : value !== undefined))) {
      setPage(1)
    }
  }, [options, open, value])

  useEffect(() => {
    if (typeof options === 'function') {
      setPage(1)
      setOptionsData([])
      setHasMore(true)
    }
  }, [options])

  useEffect(() => {
    if (typeof options === 'function' && hookResult?.data?.data) {
      const newData = hookResult.data.data.results || []
      const total = hookResult.data.data.count || 0
      setTotalItems(total)

      setOptionsData(prev => {
        if (page === 1) {
          // For first page, combine selected options with new data
          const selectedOptions = prev.filter((opt: Option) => selectedIds.includes(opt.id))
          const nonSelectedNewData = newData.filter((opt: Option) => !selectedIds.includes(opt.id))
          return [...selectedOptions, ...nonSelectedNewData]
        }
        const existingIds = new Set(prev.map((item: Option) => item.id))
        const uniqueNewData = newData.filter((item: Option) => !existingIds.has(item.id))
        // Keep selected options at the top when adding new data
        const selectedOptions = prev.filter((opt: Option) => selectedIds.includes(opt.id))
        const nonSelectedOptions = prev.filter((opt: Option) => !selectedIds.includes(opt.id))
        return [...selectedOptions, ...nonSelectedOptions, ...uniqueNewData]
      })
      setHasMore(total > page * PAGE_SIZE)
      setIsLoadingMore(false)
    } else if (Array.isArray(options)) {
      // For static options, keep selected options at the top
      const selectedOptions = options.filter((opt: Option) => selectedIds.includes(opt.id))
      const nonSelectedOptions = options.filter((opt: Option) => !selectedIds.includes(opt.id))
      setOptionsData([...selectedOptions, ...nonSelectedOptions])
      setHasMore(false)
    }
  }, [options, hookResult?.data?.data, page, PAGE_SIZE, selectedIds])

  useEffect(() => {
    if (selectedOptionsList?.length) {
      setSelectedOptionsData(selectedOptionsList)
      setSelectedIds(selectedOptionsList.map(opt => opt.id))
      if (setValue && name) {
        setValue(name, selectedOptionsList.map(opt => opt.id) as PathValue<TFormValues, Path<TFormValues>>, {
          shouldValidate: true,
          shouldDirty: true,
          shouldTouch: true
        })
      }
    }
  }, [selectedOptionsList, setValue, name])

  const handleScroll = useCallback(
    (event: React.UIEvent<HTMLUListElement>) => {
      const list = event.currentTarget
      const scrollTop = list.scrollTop
      const scrollHeight = list.scrollHeight
      const clientHeight = list.clientHeight

      const isNearBottom = scrollHeight - scrollTop - clientHeight < 50

      if (isNearBottom && !isLoadingMore && hasMore && typeof options === 'function') {
        setIsLoadingMore(true)
        setPage(prev => prev + 1)
      }
    },
    [isLoadingMore, hasMore, options]
  )

  const selectedOptions = React.useMemo(() => {
    const uniqueIds = new Set(selectedIds)
    // First try to find in selectedOptionsData
    const foundInSelected = selectedOptionsData.filter((option: Option) => uniqueIds.has(option.id))
    if (foundInSelected.length === selectedIds.length) {
      return foundInSelected
    }
    // If not all found in selectedOptionsData, look in optionsData
    const foundInOptions = optionsData.filter((option: Option) => uniqueIds.has(option.id))
    return foundInOptions
  }, [optionsData, selectedOptionsData, selectedIds])

  useEffect(() => {
    if (value !== undefined) {
      const newValue = getInitialValue(value)
      setSelectedIds(newValue)

      // If we have selected IDs and we're using a hook function, fetch the selected options
      if (newValue.length > 0 && typeof options === 'function') {
        const fetchSelectedOptions = async () => {
          try {
            const response = await (options as HookFunction)(newValue.length, 1)
            if (response.data?.data?.results) {
              const selectedOptions = response.data.data.results.filter((opt: Option) => newValue.includes(opt.id))
              setSelectedOptionsData(selectedOptions)
              setOptionsData(selectedOptions)
            }
          } catch (error) {
            console.error('Error fetching selected options:', error)
          }
        }
        fetchSelectedOptions()
      }
    }
  }, [value, options])

  const handleChange = useCallback(
    (_event: any, newValues: Option | Option[] | null) => {
      if (!newValues) {
        const newIds: number[] = []
        setSelectedIds(newIds)
        setSelectedOptionsData([])
        if (setValue && name) {
          const valueToSet = multiple
            ? newIds
            : returnAsArray
              ? newIds
              : returnAsString
                ? newIds[0]?.toString() || null
                : newIds[0] || null
          setValue(name, valueToSet as PathValue<TFormValues, Path<TFormValues>>, {
            shouldValidate: true,
            shouldDirty: true,
            shouldTouch: true
          })
        }
        onChange?.(
          multiple
            ? newIds
            : returnAsArray
              ? newIds
              : returnAsString
                ? newIds[0]?.toString() || null
                : newIds[0] || null
        )
        return
      }

      let newIds: number[]
      let newSelectedOptions: Option[]

      if (multiple) {
        const uniqueValues = Array.from(new Set((newValues as Option[]).map(value => value.id)))
        newIds = uniqueValues
        newSelectedOptions = newValues as Option[]
      } else {
        newIds = [(newValues as Option).id]
        newSelectedOptions = [newValues as Option]
      }

      // Update selectedOptionsData with the new selected options
      setSelectedOptionsData(prev => {
        const existingIds = new Set(prev.map((opt: Option) => opt.id))
        const newOptions = newSelectedOptions.filter((opt: Option) => !existingIds.has(opt.id))
        return [...prev, ...newOptions]
      })

      setSelectedIds(newIds)
      if (setValue && name) {
        const valueToSet = multiple
          ? newIds
          : returnAsArray
            ? newIds
            : returnAsString
              ? newIds[0].toString()
              : newIds[0]
        setValue(name, valueToSet as PathValue<TFormValues, Path<TFormValues>>, {
          shouldValidate: true,
          shouldDirty: true,
          shouldTouch: true
        })
      }
      onChange?.(multiple ? newIds : returnAsArray ? newIds : returnAsString ? newIds[0].toString() : newIds[0])
    },
    [multiple, returnAsArray, returnAsString, setValue, name, onChange]
  )

  const handleDelete = useCallback(
    (optionToDelete: Option) => {
      const newSelectedIds = selectedIds.filter(id => id !== optionToDelete.id)
      setSelectedIds(newSelectedIds)
      setSelectedOptionsData(prev => prev.filter(opt => opt.id !== optionToDelete.id))
      if (setValue && name) {
        const valueToSet = multiple
          ? newSelectedIds
          : returnAsArray
            ? newSelectedIds
            : returnAsString
              ? newSelectedIds[0]?.toString() || null
              : newSelectedIds[0] || null
        setValue(name, valueToSet as PathValue<TFormValues, Path<TFormValues>>, {
          shouldValidate: true,
          shouldDirty: true,
          shouldTouch: true
        })
      }
      onChange?.(
        multiple
          ? newSelectedIds
          : returnAsArray
            ? newSelectedIds
            : returnAsString
              ? newSelectedIds[0]?.toString() || null
              : newSelectedIds[0] || null
      )
    },
    [selectedIds, multiple, returnAsArray, returnAsString, setValue, name, onChange]
  )

  const getDisplayLabel = useCallback(
    (option: Option): string => {
      if (typeof option === 'string') return option
      return option[labelKey as keyof Option] || ''
    },
    [labelKey]
  )

  const { ref } = register ? register(name) : { ref: null }

  return (
    <Autocomplete<Option, typeof multiple>
      multiple={multiple}
      options={optionsData}
      getOptionLabel={getDisplayLabel}
      value={multiple ? selectedOptions : selectedOptions[0] || null}
      onChange={handleChange}
      disabled={disabled}
      clearIcon={null}
      className={className}
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => {
        setOpen(false)
      }}
      freeSolo={true}
      isOptionEqualToValue={(option, value) => option.id === value.id}
      filterOptions={options => options}
      openOnFocus={true}
      PaperComponent={CustomPaper}
      ListboxProps={{
        onScroll: handleScroll as React.UIEventHandler<HTMLUListElement>,
        style: {
          maxHeight: '300px',
          overflowY: 'auto'
        }
      }}
      loading={hookResult?.isLoading || isLoadingMore || isSearching}
      loadingText={
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <CircularProgress size={20} />
          <span style={{ marginLeft: 10 }}>Loading more...</span>
        </Box>
      }
      renderInput={params => (
        <TextField
          {...params}
          inputRef={ref}
          variant='outlined'
          fullWidth
          label={
            showAsterisk ? (
              <span>
                {label}
                <span style={{ color: 'red' }}> *</span>
              </span>
            ) : (
              label
            )
          }
          error={error || !!fieldError}
          helperText={fieldError?.message}
          required={required}
          InputLabelProps={{
            shrink: true
          }}
          InputProps={{
            ...params.InputProps,
            onChange: handleSearchChange,
            endAdornment: (
              <>
                {(hookResult?.isLoading || isLoadingMore || isSearching) && (
                  <CircularProgress size={20} sx={{ marginRight: 1 }} />
                )}
                {params.InputProps.endAdornment}
              </>
            )
          }}
        />
      )}
      renderTags={(tagValue: Option[], getTagProps: AutocompleteRenderGetTagProps) =>
        tagValue.map((option: Option, index: number) => {
          const canDelete = multiple && option.id !== defaultOption?.id
          const tagProps = getTagProps({ index })
          const { key: _, ...tagPropsWithoutKey } = tagProps
          return (
            <StyledChip
              {...tagPropsWithoutKey}
              key={`tag-${option.id}`}
              label={getDisplayLabel(option)}
              deleteIcon={canDelete ? <CloseIcon /> : undefined}
              onDelete={canDelete ? () => handleDelete(option) : undefined}
            />
          )
        })
      }
      renderOption={(props, option: Option) => {
        const { key, ...propsWithoutKey } = props
        const isSelected = selectedIds.includes(option.id)
        return (
          <Box
            component='li'
            {...propsWithoutKey}
            key={`option-${option.id}`}
            sx={{
              backgroundColor: isSelected ? 'primary.light' : 'inherit',
              '&:hover': {
                backgroundColor: isSelected ? 'primary.main' : 'action.hover'
              }
            }}
          >
            {getDisplayLabel(option)}
          </Box>
        )
      }}
    />
  )
}

export default SearchableMultiSelect
