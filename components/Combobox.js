import { useCombobox } from "downshift";
import Icon, { icons } from "./Icon";

function ComboboxLabel({ getLabelProps, label }) {
  return <label {...getLabelProps()}>{label}</label>;
}

function InputContainer({ getComboboxProps, children }) {
  return (
    <div {...getComboboxProps()} className={`rounded-md flex border`}>
      {children}
    </div>
  );
}

function Input({
  getInputProps,
  isOpen,
  closeMenu,
  openMenu,
  readOnly = false,
  disabled,
  items,
}) {
  return (
    <input
      {...getInputProps({
        onClick: () => {
          if (isOpen && items?.length > 0) closeMenu();
          else if (!disabled && items?.length > 0) openMenu();
        },
      })}
      readOnly={readOnly}
      className={`${
        disabled
          ? `cursor-not-allowed bg-gray-300`
          : ` ${readOnly ? "cursor-pointer" : "cursor-text"}`
      } 
        
        flex-1 p-2 rounded-l-md focus:shadow-outline focus:outline-none`}
    />
  );
}

function ToggleButton({ getToggleButtonProps, isOpen, disabled, items }) {
  return (
    <button
      type="button"
      {...getToggleButtonProps()}
      aria-label="toggle menu"
      className={`${
        disabled ? "cursor-not-allowed bg-gray-300" : ""
      } p-2 rounded-r-md`}
      disabled={disabled}
    >
      {items?.length > 0 ? (
        isOpen ? (
          <Icon name={icons.CHEVRON_UP} />
        ) : (
          <Icon name={icons.CHEVRON_DOWN} />
        )
      ) : (
        <Icon name={icons.CHEVRON_DOWN} />
      )}
    </button>
  );
}

function ComboboxItemList({ getMenuProps, children }) {
  return (
    <ul
      {...getMenuProps()}
      className="rounded-md shadow-md absolute left-0 right-0 z-10 "
    >
      {children}
    </ul>
  );
}

function ComboboxItem({
  getItemProps,
  isFirst,
  isLast,
  item,
  index,
  highlightedIndex,
}) {
  return (
    <li
      className={`bg-white p-2 truncate cursor-pointer
    ${isFirst ? "rounded-t-md mt" : ""} 
    ${isLast ? "rounded-b-md" : ""} 
    ${highlightedIndex === index ? "bg-purple-200" : ""}`}
      key={`${item}${index}`}
      {...getItemProps({ item, index })}
    >
      {item.component ?? item.label}
    </li>
  );
}

function Combobox({
  items,
  selectedItem,
  handleSelectedItemChange,
  label,
  disabled,
}) {
  const {
    isOpen,
    getToggleButtonProps,
    getLabelProps,
    getMenuProps,
    getInputProps,
    getComboboxProps,
    highlightedIndex,
    getItemProps,
    openMenu,
    closeMenu,
    selectItem,
  } = useCombobox({
    items,
    selectedItem,
    onSelectedItemChange: ({ selectedItem }) =>
      handleSelectedItemChange(selectedItem),
    itemToString: (item) => item.label,
  });
  return (
    <div className="relative">
      <ComboboxLabel getLabelProps={getLabelProps} label={label} />
      <InputContainer getComboboxProps={getComboboxProps}>
        <Input
          readOnly={true}
          isOpen={isOpen}
          getInputProps={getInputProps}
          openMenu={openMenu}
          closeMenu={closeMenu}
          selectedItem={selectedItem}
          disabled={disabled}
          items={items}
        />
        {getInputProps().value !== "" ? (
          <button
            className={`${
              disabled ? "cursor-not-allowed bg-gray-300" : ""
            } px-2`}
            tabindex={-1}
            onClick={() => {
              selectItem({ value: -1, label: "" });

              // handleSelectedItemChange({ value: { id: 0 } })
            }}
            aria-label="clear selection"
            disabled={disabled}
          >
            &#215;
          </button>
        ) : (
          ""
        )}
        <ToggleButton
          getToggleButtonProps={getToggleButtonProps}
          isOpen={isOpen}
          disabled={disabled}
          items={items}
        />
      </InputContainer>
      <ComboboxItemList getMenuProps={getMenuProps}>
        {isOpen &&
          items.map((item, index) => (
            <ComboboxItem
              isFirst={index === 0}
              isLast={index === items.length - 1}
              item={item}
              index={index}
              highlightedIndex={highlightedIndex}
              getItemProps={getItemProps}
              selectedItem={selectedItem}
            />
          ))}
      </ComboboxItemList>
    </div>
  );
}

export default Combobox;
