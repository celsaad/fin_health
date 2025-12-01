package utils

import (
	"encoding/base64"
	"fmt"
	"strconv"
	"strings"
)

// ToGlobalID creates a globally unique ID by combining type and local ID
func ToGlobalID(typeName string, localID uint) string {
	// Format: "TypeName:localID" then base64 encode for obfuscation
	combined := fmt.Sprintf("%s:%d", typeName, localID)
	return base64.StdEncoding.EncodeToString([]byte(combined))
}

// FromGlobalID extracts the type and local ID from a global ID
func FromGlobalID(globalID string) (typeName string, localID uint, err error) {
	decoded, err := base64.StdEncoding.DecodeString(globalID)
	if err != nil {
		return "", 0, fmt.Errorf("invalid global ID format")
	}

	parts := strings.Split(string(decoded), ":")
	if len(parts) != 2 {
		return "", 0, fmt.Errorf("invalid global ID structure")
	}

	id, err := strconv.Atoi(parts[1])
	if err != nil {
		return "", 0, fmt.Errorf("invalid local ID")
	}

	return parts[0], uint(id), nil
}

// Simple version without base64 encoding for easier debugging
func ToSimpleGlobalID(typeName string, localID uint) string {
	return fmt.Sprintf("%s:%d", typeName, localID)
}

func FromSimpleGlobalID(globalID string) (typeName string, localID uint, err error) {
	parts := strings.Split(globalID, ":")
	if len(parts) != 2 {
		return "", 0, fmt.Errorf("invalid global ID structure")
	}

	id, err := strconv.Atoi(parts[1])
	if err != nil {
		return "", 0, fmt.Errorf("invalid local ID")
	}

	return parts[0], uint(id), nil
}
