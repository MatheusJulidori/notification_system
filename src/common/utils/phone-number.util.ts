import {
    parsePhoneNumberWithError,
    isValidPhoneNumber,
    getCountries,
    getCountryCallingCode,
    CountryCode,
    PhoneNumber,
} from 'libphonenumber-js';

/**
 * Phone Number Utility Functions
 *
 * This module provides utilities for phone number validation,
 * formatting, and country detection using libphonenumber-js.
 */

export interface PhoneNumberValidationResult {
    isValid: boolean;
    message?: string;
    formattedNumber?: string;
    country?: string;
}

export interface PhoneNumberInfo {
    number: string;
    country: string;
    countryCallingCode: string;
    nationalNumber: string;
    type?: string;
    isValid: boolean;
}

/**
 * Validates a phone number
 * @param phoneNumber - The phone number to validate (can include country code)
 * @param defaultCountry - Optional default country code (e.g., 'US', 'BR', 'GB')
 * @returns Validation result with details
 *
 * @example
 * ```typescript
 * const result = validatePhoneNumber('+1234567890');
 * console.log(result.isValid); // true or false
 * ```
 */
export function validatePhoneNumber(
    phoneNumber: string,
    defaultCountry?: CountryCode,
): PhoneNumberValidationResult {
    if (!phoneNumber || phoneNumber.trim() === '') {
        return {
            isValid: false,
            message: 'Phone number cannot be empty',
        };
    }

    try {
        const isValid = isValidPhoneNumber(phoneNumber, defaultCountry);

        if (!isValid) {
            return {
                isValid: false,
                message: 'Invalid phone number format',
            };
        }

        const parsedNumber = parsePhoneNumberWithError(phoneNumber, defaultCountry);

        return {
            isValid: true,
            message: 'Valid phone number',
            formattedNumber: parsedNumber.formatInternational(),
            country: parsedNumber.country,
        };
    } catch (error) {
        return {
            isValid: false,
            message:
                error instanceof Error ? error.message : 'Invalid phone number',
        };
    }
}

/**
 * Formats a phone number to E.164 format (international standard)
 * @param phoneNumber - The phone number to format
 * @param defaultCountry - Optional default country code
 * @returns Formatted phone number in E.164 format (e.g., +14155552671) or null if invalid
 *
 * @example
 * ```typescript
 * const formatted = formatToE164('+1 (415) 555-2671');
 * console.log(formatted); // '+14155552671'
 * ```
 */
export function formatToE164(
    phoneNumber: string,
    defaultCountry?: CountryCode,
): string | null {
    try {
        const parsedNumber = parsePhoneNumberWithError(phoneNumber, defaultCountry);

        if (!parsedNumber.isValid()) {
            return null;
        }

        return parsedNumber.format('E.164');
    } catch (error) {
        return null;
    }
}

/**
 * Formats a phone number to international format
 * @param phoneNumber - The phone number to format
 * @param defaultCountry - Optional default country code
 * @returns Formatted phone number in international format (e.g., +1 415 555 2671) or null if invalid
 *
 * @example
 * ```typescript
 * const formatted = formatToInternational('+14155552671');
 * console.log(formatted); // '+1 415 555 2671'
 * ```
 */
export function formatToInternational(
    phoneNumber: string,
    defaultCountry?: CountryCode,
): string | null {
    try {
        const parsedNumber = parsePhoneNumberWithError(phoneNumber, defaultCountry);

        if (!parsedNumber.isValid()) {
            return null;
        }

        return parsedNumber.formatInternational();
    } catch (error) {
        return null;
    }
}

/**
 * Formats a phone number to national format
 * @param phoneNumber - The phone number to format
 * @param defaultCountry - Optional default country code
 * @returns Formatted phone number in national format (e.g., (415) 555-2671) or null if invalid
 *
 * @example
 * ```typescript
 * const formatted = formatToNational('+14155552671', 'US');
 * console.log(formatted); // '(415) 555-2671'
 * ```
 */
export function formatToNational(
    phoneNumber: string,
    defaultCountry?: CountryCode,
): string | null {
    try {
        const parsedNumber = parsePhoneNumberWithError(phoneNumber, defaultCountry);

        if (!parsedNumber.isValid()) {
            return null;
        }

        return parsedNumber.formatNational();
    } catch (error) {
        return null;
    }
}

/**
 * Gets the country code from a phone number
 * @param phoneNumber - The phone number to analyze
 * @param defaultCountry - Optional default country code
 * @returns Country code (e.g., 'US', 'BR', 'GB') or null if not found
 *
 * @example
 * ```typescript
 * const country = getCountryFromPhoneNumber('+14155552671');
 * console.log(country); // 'US'
 * ```
 */
export function getCountryFromPhoneNumber(
    phoneNumber: string,
    defaultCountry?: CountryCode,
): string | null {
    try {
        const parsedNumber = parsePhoneNumberWithError(phoneNumber, defaultCountry);

        if (!parsedNumber.isValid()) {
            return null;
        }

        return parsedNumber.country || null;
    } catch (error) {
        return null;
    }
}

/**
 * Gets detailed information about a phone number
 * @param phoneNumber - The phone number to analyze
 * @param defaultCountry - Optional default country code
 * @returns Detailed phone number information or null if invalid
 *
 * @example
 * ```typescript
 * const info = getPhoneNumberInfo('+14155552671');
 * console.log(info);
 *  {
 *    number: '+14155552671',
 *    country: 'US',
 *    countryCallingCode: '1',
 *    nationalNumber: '4155552671',
 *    type: 'FIXED_LINE_OR_MOBILE',
 *    isValid: true
 *  }
 * ```
 */
export function getPhoneNumberInfo(
    phoneNumber: string,
    defaultCountry?: CountryCode,
): PhoneNumberInfo | null {
    try {
        const parsedNumber = parsePhoneNumberWithError(phoneNumber, defaultCountry);

        if (!parsedNumber.isValid()) {
            return null;
        }

        return {
            number: parsedNumber.number,
            country: parsedNumber.country || 'Unknown',
            countryCallingCode: parsedNumber.countryCallingCode,
            nationalNumber: parsedNumber.nationalNumber,
            type: parsedNumber.getType() || undefined,
            isValid: parsedNumber.isValid(),
        };
    } catch (error) {
        return null;
    }
}

/**
 * Gets the calling code for a specific country
 * @param countryCode - The country code (e.g., 'US', 'BR', 'GB')
 * @returns The calling code (e.g., '1' for US, '55' for BR) or null if not found
 *
 * @example
 * ```typescript
 * const callingCode = getCallingCodeForCountry('US');
 * console.log(callingCode); // '1'
 * ```
 */
export function getCallingCodeForCountry(
    countryCode: CountryCode,
): string | null {
    try {
        return getCountryCallingCode(countryCode);
    } catch (error) {
        return null;
    }
}

/**
 * Gets a list of all supported countries
 * @returns Array of country codes
 *
 * @example
 * ```typescript
 * const countries = getSupportedCountries();
 * console.log(countries); // ['US', 'BR', 'GB', ...]
 * ```
 */
export function getSupportedCountries(): CountryCode[] {
    return getCountries();
}

/**
 * Checks if a phone number is from a specific country
 * @param phoneNumber - The phone number to check
 * @param countryCode - The country code to verify
 * @param defaultCountry - Optional default country code
 * @returns True if the phone number is from the specified country
 *
 * @example
 * ```typescript
 * const isUS = isPhoneNumberFromCountry('+14155552671', 'US');
 * console.log(isUS); // true
 * ```
 */
export function isPhoneNumberFromCountry(
    phoneNumber: string,
    countryCode: CountryCode,
    defaultCountry?: CountryCode,
): boolean {
    try {
        const parsedNumber = parsePhoneNumberWithError(phoneNumber, defaultCountry);
        return parsedNumber.country === countryCode;
    } catch (error) {
        return false;
    }
}

/**
 * Normalizes a phone number by removing all formatting
 * @param phoneNumber - The phone number to normalize
 * @returns Normalized phone number (only digits and +)
 *
 * @example
 * ```typescript
 * const normalized = normalizePhoneNumber('+1 (415) 555-2671');
 * console.log(normalized); // '+14155552671'
 * ```
 */
export function normalizePhoneNumber(phoneNumber: string): string {
    return phoneNumber.replace(/[^+\d]/g, '');
}
