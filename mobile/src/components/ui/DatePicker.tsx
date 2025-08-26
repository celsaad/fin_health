import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { noop } from "lodash";
import { useCallback, useState } from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Modal,
  View,
  Platform,
} from "react-native";

import { useThemeColor } from "@/src/hooks/useThemeColor";

import { IconSymbol } from "./IconSymbol";

export default function DateInput({
  date,
  setDate,
}: {
  date: Date;
  setDate: (date: Date) => void;
}) {
  const [show, setShow] = useState(false);

  const backgroundColor = useThemeColor(
    { light: "#f0f0f0", dark: "#333333" },
    "background",
  );
  const textColor = useThemeColor(
    { light: "#000000", dark: "#ffffff" },
    "text",
  );
  const iconColor = useThemeColor(
    { light: "#666666", dark: "#999999" },
    "icon",
  );
  const modalBgColor = useThemeColor(
    { light: "#ffffff", dark: "#1c1c1e" },
    "background",
  );
  const borderColor = useThemeColor(
    { light: "#e0e0e0", dark: "#333333" },
    "icon",
  );

  const handleDateChange = useCallback(
    (event: DateTimePickerEvent, selectedDate?: Date) => {
      if (Platform.OS === "android") {
        setShow(false);
      }
      if (selectedDate) {
        setDate(selectedDate);
      }
    },
    [setDate],
  );

  const handleConfirm = useCallback(() => {
    setShow(false);
  }, []);

  const handleCancel = useCallback(() => {
    setShow(false);
  }, []);

  const showDatePicker = useCallback(() => {
    setShow(true);
  }, []);

  return (
    <>
      <TouchableOpacity
        style={[styles.dateInput, { backgroundColor }]}
        onPress={showDatePicker}
      >
        <Text style={[styles.dateText, { color: textColor }]}>
          {date.toLocaleDateString()}
        </Text>
        <IconSymbol name="calendar" size={20} color={iconColor} />
      </TouchableOpacity>

      <Modal
        transparent={true}
        animationType="slide"
        visible={show}
        onRequestClose={handleCancel}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={handleCancel}
        >
          <TouchableOpacity
            style={[styles.modalContent, { backgroundColor: modalBgColor }]}
            activeOpacity={1}
            onPress={noop}
          >
            {Platform.OS === "ios" && (
              <View
                style={[styles.modalHeader, { borderBottomColor: borderColor }]}
              >
                <TouchableOpacity onPress={handleCancel}>
                  <Text style={[styles.cancelButton, { color: textColor }]}>
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleConfirm}>
                  <Text style={[styles.confirmButton, { color: textColor }]}>
                    Done
                  </Text>
                </TouchableOpacity>
              </View>
            )}
            <DateTimePicker
              testID="dateTimePicker"
              value={date}
              mode="date"
              is24Hour={true}
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={handleDateChange}
              style={styles.datePicker}
            />
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  dateInput: {
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dateText: {
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    justifyContent: "flex-end",
  },
  modalContent: {
    width: "100%",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  cancelButton: {
    fontSize: 17,
  },
  confirmButton: {
    fontSize: 17,
    fontWeight: "600",
  },
  datePicker: {
    width: "100%",
    alignSelf: "center",
  },
});
