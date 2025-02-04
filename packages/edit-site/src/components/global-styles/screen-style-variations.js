/**
 * WordPress dependencies
 */
import { Card, CardBody } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useZoomOut } from '@wordpress/block-editor';

/**
 * Internal dependencies
 */
import ScreenHeader from './header';
import StyleVariationsContainer from './style-variations-container';

function ScreenStyleVariations() {
	// Move to zoom out mode when this component is mounted
	// and back to the previous mode when unmounted.
	useZoomOut();

	return (
		<>
			<ScreenHeader
				back="/"
				title={ __( 'Browse styles' ) }
				description={ __(
					'Choose a variation to change the look of the site.'
				) }
			/>

			<Card
				size="small"
				isBorderless
				className="edit-site-global-styles-screen-style-variations"
			>
				<CardBody>
					<StyleVariationsContainer />
				</CardBody>
			</Card>
		</>
	);
}

export default ScreenStyleVariations;
