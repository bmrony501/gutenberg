/**
 * WordPress dependencies
 */
import { swatch } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import ColorIndicator from '../color-indicator';
import Icon from '../icon';
import { getGradientFromCSSColors } from './utils';

function DuotoneSwatch( { values } ) {
	return values ? (
		<ColorIndicator
			colorValue={ getGradientFromCSSColors( values, '135deg' ) }
		/>
	) : (
		<Icon icon={ swatch } />
	);
}

export default DuotoneSwatch;
