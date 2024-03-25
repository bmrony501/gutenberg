/**
 * External dependencies
 */
// eslint-disable-next-line no-restricted-imports
import * as Ariakit from '@ariakit/react';
/**
 * Internal dependencies
 */
import _CustomSelect from '../custom-select';
import type { CustomSelectProps } from '../types';
import type { WordPressComponentProps } from '../../context';

function CustomSelectControlV2(
	props: WordPressComponentProps< CustomSelectProps, 'button', false >
) {
	const { defaultValue, onChange, value, ...restProps } = props;
	// Forward props + store from v2 implementation
	const store = Ariakit.useSelectStore( {
		setValue: ( nextValue ) => onChange?.( nextValue ),
		defaultValue,
		value,
	} );

	return <_CustomSelect { ...restProps } store={ store } />;
}

export default CustomSelectControlV2;
