import { Colors } from '@/constants/Colors';
import { useTheme } from '@/contexts/ThemeContext';
import { changeClass } from '@/service/Class/DB/changeClass';
import { getClass } from '@/service/Class/DB/getClass';
import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';

const letters = ["a", "b", "c"];
let classes: string[] = [];

for (let i = 5; i < 12; i++) {
  for (let letter of letters) {
    classes.push(`${i}${letter}`); 
  }
}
classes.push("Q12", "Q13");

const classItems = classes.map(cls => ({ label: cls, value: cls }));

export default function ClassDropdown() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(null);
  const [items, setItems] = useState(classItems);
  const { theme } = useTheme();
  const colors = theme === 'light' ? Colors.light : Colors.dark;
  const [placeholder, setPlaceholder] = useState("Loading..."); 
  

  useEffect(() => {
  const fetchClass = async () => {
    setPlaceholder("lol");
    const { data, error } = await getClass();
    if (error) {
      setPlaceholder("Error loading class");
    } else {
      const dbClass = data?.[0]?.class;
      if (dbClass) {
        setValue(dbClass);
      }
      setPlaceholder("Select class");
    }
  };
  fetchClass();
}, []);

  return (
    <DropDownPicker
      open={open}
      value={value}
      items={items}
      setOpen={setOpen}
      setValue={setValue}
      setItems={setItems}
      placeholder={placeholder}
      placeholderStyle={{ color: colors.placeholder }}
      showArrowIcon={false}
      textStyle={{ color: colors.text }}
      style={[
        styles.box_measures, 
        { 
          backgroundColor: colors.background, 
          borderColor: colors.tint 
        }
      ]}
      dropDownContainerStyle={{ 
        backgroundColor: colors.background, 
        borderColor: colors.tint 
      }}
      labelStyle={{ color: colors.text }}
      onChangeValue={(val) => {
        if (val) {
          changeClass(val);
        }
      }}
    />
  );
}

const styles = StyleSheet.create({
  box_measures: {
    height: 50,
    width: 140,
    marginLeft: 10,
  },
});