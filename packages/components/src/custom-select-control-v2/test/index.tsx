/**
 * External dependencies
 */
import { render, screen } from '@testing-library/react';
import { click, press, sleep, type } from '@ariakit/test';

/**
 * WordPress dependencies
 */
import { useState } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { CustomSelect as UncontrolledCustomSelect, CustomSelectItem } from '..';
import type { CustomSelectProps } from '../types';

const items = [
	{
		key: 'flower1',
		value: 'violets',
	},
	{
		key: 'flower2',
		value: 'crimson clover',
	},
	{
		key: 'flower3',
		value: 'poppy',
	},
	{
		key: 'color1',
		value: 'amber',
	},
	{
		key: 'color2',
		value: 'aquamarine',
	},
];

const defaultProps = {
	label: 'label!',
	children: items.map( ( { value, key } ) => (
		<CustomSelectItem value={ value } key={ key } />
	) ),
};

const ControlledCustomSelect = ( props: CustomSelectProps ) => {
	const [ value, setValue ] = useState< string | string[] >();
	return (
		<UncontrolledCustomSelect
			{ ...props }
			onChange={ ( nextValue: string | string[] ) => {
				setValue( nextValue );
				props.onChange?.( nextValue );
			} }
			value={ value }
		/>
	);
};

describe.each( [
	[ 'Uncontrolled', UncontrolledCustomSelect ],
	[ 'Controlled', ControlledCustomSelect ],
] )( 'CustomSelectControlV2 (%s)', ( ...modeAndComponent ) => {
	const [ , Component ] = modeAndComponent;

	it( 'Should replace the initial selection when a new item is selected', async () => {
		render( <Component { ...defaultProps } /> );

		const currentSelectedItem = screen.getByRole( 'combobox', {
			expanded: false,
		} );

		await click( currentSelectedItem );

		await click(
			screen.getByRole( 'option', {
				name: 'crimson clover',
			} )
		);

		expect( currentSelectedItem ).toHaveTextContent( 'crimson clover' );

		await click( currentSelectedItem );

		await click(
			screen.getByRole( 'option', {
				name: 'poppy',
			} )
		);

		expect( currentSelectedItem ).toHaveTextContent( 'poppy' );
	} );

	it( 'Should keep current selection if dropdown is closed without changing selection', async () => {
		render( <Component { ...defaultProps } /> );

		const currentSelectedItem = screen.getByRole( 'combobox', {
			expanded: false,
		} );

		await sleep();
		await press.Tab();
		await press.Enter();
		expect(
			screen.getByRole( 'listbox', {
				name: 'label!',
			} )
		).toBeVisible();

		await press.Escape();
		expect(
			screen.queryByRole( 'listbox', {
				name: 'label!',
			} )
		).not.toBeInTheDocument();

		expect( currentSelectedItem ).toHaveTextContent( items[ 0 ].value );
	} );

	describe( 'Keyboard behavior and accessibility', () => {
		it( 'Should be able to change selection using keyboard', async () => {
			render( <Component { ...defaultProps } /> );

			const currentSelectedItem = screen.getByRole( 'combobox', {
				expanded: false,
			} );

			await sleep();
			await press.Tab();
			expect( currentSelectedItem ).toHaveFocus();

			await press.Enter();
			expect(
				screen.getByRole( 'listbox', {
					name: 'label!',
				} )
			).toHaveFocus();

			await press.ArrowDown();
			await press.Enter();

			expect( currentSelectedItem ).toHaveTextContent( 'crimson clover' );
		} );

		it( 'Should be able to type characters to select matching options', async () => {
			render( <Component { ...defaultProps } /> );

			const currentSelectedItem = screen.getByRole( 'combobox', {
				expanded: false,
			} );

			await sleep();
			await press.Tab();
			await press.Enter();
			expect(
				screen.getByRole( 'listbox', {
					name: 'label!',
				} )
			).toHaveFocus();

			await type( 'a' );
			await press.Enter();
			expect( currentSelectedItem ).toHaveTextContent( 'amber' );
		} );

		it( 'Can change selection with a focused input and closed dropdown if typed characters match an option', async () => {
			render( <Component { ...defaultProps } /> );

			const currentSelectedItem = screen.getByRole( 'combobox', {
				expanded: false,
			} );

			await sleep();
			await press.Tab();
			expect( currentSelectedItem ).toHaveFocus();
			expect( currentSelectedItem ).toHaveTextContent( 'violets' );

			// Ideally we would test a multi-character typeahead, but anything more than a single character is flaky
			await type( 'a' );

			expect(
				screen.queryByRole( 'listbox', {
					name: 'label!',
					hidden: true,
				} )
			).not.toBeInTheDocument();

			// This Enter is a workaround for flakiness, and shouldn't be necessary in an actual browser
			await press.Enter();

			expect( currentSelectedItem ).toHaveTextContent( 'amber' );
		} );

		it( 'Should have correct aria-selected value for selections', async () => {
			render( <Component { ...defaultProps } /> );

			const currentSelectedItem = screen.getByRole( 'combobox', {
				expanded: false,
			} );

			await click( currentSelectedItem );

			// assert that first item has aria-selected="true"
			expect(
				screen.getByRole( 'option', {
					name: 'violets',
					selected: true,
				} )
			).toBeVisible();

			// change the current selection
			await click( screen.getByRole( 'option', { name: 'poppy' } ) );

			// click combobox to mount listbox with options again
			await click( currentSelectedItem );

			// check that first item is has aria-selected="false" after new selection
			expect(
				screen.getByRole( 'option', {
					name: 'violets',
					selected: false,
				} )
			).toBeVisible();

			// check that new selected item now has aria-selected="true"
			expect(
				screen.getByRole( 'option', {
					name: 'poppy',
					selected: true,
				} )
			).toBeVisible();
		} );
	} );

	describe( 'Multiple selection', () => {
		it( 'Should be able to select multiple items when provided an array', async () => {
			const onChangeMock = jest.fn();

			// initial selection as defaultValue
			const defaultValues = [
				'incandescent glow',
				'ultraviolet morning light',
			];

			render(
				<Component
					defaultValue={ defaultValues }
					onChange={ onChangeMock }
					label="Multi-select"
				>
					{ [
						'aurora borealis green',
						'flamingo pink sunrise',
						'incandescent glow',
						'rose blush',
						'ultraviolet morning light',
					].map( ( item ) => (
						<CustomSelectItem key={ item } value={ item }>
							{ item }
						</CustomSelectItem>
					) ) }
				</Component>
			);

			const currentSelectedItem = screen.getByRole( 'combobox', {
				expanded: false,
			} );

			// ensure more than one item is selected due to defaultValues
			expect( currentSelectedItem ).toHaveTextContent(
				`${ defaultValues.length } items selected`
			);

			await click( currentSelectedItem );

			expect( screen.getByRole( 'listbox' ) ).toHaveAttribute(
				'aria-multiselectable'
			);

			// ensure defaultValues are selected in list of items
			defaultValues.forEach( ( value ) =>
				expect(
					screen.getByRole( 'option', {
						name: value,
						selected: true,
					} )
				).toBeVisible()
			);

			// name of next selection
			const nextSelectionName = 'rose blush';

			// element for next selection
			const nextSelection = screen.getByRole( 'option', {
				name: nextSelectionName,
			} );

			// click next selection to add another item to current selection
			await click( nextSelection );

			// updated array containing defaultValues + the item just selected
			const updatedSelection = defaultValues.concat( nextSelectionName );

			expect( onChangeMock ).toHaveBeenCalledWith( updatedSelection );

			expect( nextSelection ).toHaveAttribute( 'aria-selected' );

			// expect increased array length for current selection
			expect( currentSelectedItem ).toHaveTextContent(
				`${ updatedSelection.length } items selected`
			);
		} );

		it( 'Should be able to deselect items when provided an array', async () => {
			// initial selection as defaultValue
			const defaultValues = [
				'aurora borealis green',
				'incandescent glow',
				'key lime green',
				'rose blush',
				'ultraviolet morning light',
			];

			render(
				<Component defaultValue={ defaultValues } label="Multi-select">
					{ defaultValues.map( ( item ) => (
						<CustomSelectItem key={ item } value={ item }>
							{ item }
						</CustomSelectItem>
					) ) }
				</Component>
			);

			const currentSelectedItem = screen.getByRole( 'combobox', {
				expanded: false,
			} );

			await click( currentSelectedItem );

			// Array containing items to deselect
			const nextSelection = [
				'aurora borealis green',
				'rose blush',
				'incandescent glow',
			];

			// Deselect some items by clicking them to ensure that changes
			// are reflected correctly
			await Promise.all(
				nextSelection.map( async ( value ) => {
					await click(
						screen.getByRole( 'option', { name: value } )
					);
					expect(
						screen.getByRole( 'option', {
							name: value,
							selected: false,
						} )
					).toBeVisible();
				} )
			);

			// expect different array length from defaultValues due to deselecting items
			expect( currentSelectedItem ).toHaveTextContent(
				`${
					defaultValues.length - nextSelection.length
				} items selected`
			);
		} );
	} );

	it( 'Should allow rendering a custom value when using `renderSelectedValue`', async () => {
		const renderValue = ( value: string | string[] ) => {
			return <img src={ `${ value }.jpg` } alt={ value as string } />;
		};

		render(
			<Component label="Rendered" renderSelectedValue={ renderValue }>
				<CustomSelectItem value="april-29">
					{ renderValue( 'april-29' ) }
				</CustomSelectItem>
				<CustomSelectItem value="july-9">
					{ renderValue( 'july-9' ) }
				</CustomSelectItem>
			</Component>
		);

		const currentSelectedItem = screen.getByRole( 'combobox', {
			expanded: false,
		} );

		expect( currentSelectedItem ).toBeVisible();

		// expect that the initial selection renders an image
		expect( currentSelectedItem ).toContainElement(
			screen.getByRole( 'img', { name: 'april-29' } )
		);

		expect(
			screen.queryByRole( 'img', { name: 'july-9' } )
		).not.toBeInTheDocument();

		await click( currentSelectedItem );

		// expect that the other image is only visible after opening popover with options
		expect( screen.getByRole( 'img', { name: 'july-9' } ) ).toBeVisible();
		expect(
			screen.getByRole( 'option', { name: 'july-9' } )
		).toBeVisible();
	} );
} );
