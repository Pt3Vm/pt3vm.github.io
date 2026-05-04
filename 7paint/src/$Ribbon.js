import { $Component } from "./$Component.js";
import { E } from "./helpers.js";
import { menus } from "./menus.js";
import { tools } from "./tools.js";
import { 
	select_tool, edit_cut, edit_copy, edit_paste, 
	image_attributes, image_flip_and_rotate, image_stretch_and_skew,
	select_all, delete_selection
} from "./functions.js";

/**
 * @returns {JQuery<HTMLDivElement> & I$Ribbon & I$Component}
 */
export function $Ribbon() {
	const $ribbon = $(E("div")).addClass("ribbon");

	const $top_bar = $(E("div")).addClass("ribbon-top-bar").appendTo($ribbon);
	const $file_button = $(E("div")).addClass("ribbon-file-button").text("File").appendTo($top_bar);
	const $tabs_header = $(E("div")).addClass("ribbon-tabs-header").appendTo($top_bar);
	
	const $content_area = $(E("div")).addClass("ribbon-content-area").appendTo($ribbon);

	const tabs = [
		{ id: "home", label: "Home" },
		{ id: "view", label: "View" },
	];

	const $tab_buttons = tabs.map((tab) => {
		const $button = $(E("div"))
			.addClass("ribbon-tab-button")
			.text(tab.label)
			.appendTo($tabs_header)
			.on("click", () => {
				select_tab(tab.id);
			});
		return { id: tab.id, $button };
	});

	function select_tab(id) {
		$tab_buttons.forEach((tab) => {
			tab.$button.toggleClass("active", tab.id === id);
		});
		render_tab_content(id);
	}

	function render_tab_content(id) {
		$content_area.empty();
		if (id === "home") {
			render_home_tab();
		} else if (id === "view") {
			render_view_tab();
		}
	}

	function create_ribbon_button(label, icon_class, action, is_large = false) {
		const $btn = $(E("div"))
			.addClass("ribbon-button")
			.toggleClass("large", is_large)
			.on("click", action);
		
		$(E("div")).addClass("ribbon-button-icon").addClass(icon_class).appendTo($btn);
		$(E("div")).addClass("ribbon-button-label").text(label).appendTo($btn);
		
		return $btn;
	}

	function create_ribbon_dropdown(label, icon_class, options) {
		const $btn = $(E("div")).addClass("ribbon-button large has-dropdown");
		const $main_part = $(E("div")).addClass("ribbon-button-main").on("click", () => options[0].action()).appendTo($btn);
		$(E("div")).addClass("ribbon-button-icon").addClass(icon_class).appendTo($main_part);
		$(E("div")).addClass("ribbon-button-label").text(label).appendTo($main_part);
		
		const $arrow = $(E("div")).addClass("ribbon-button-arrow").text("▼").appendTo($btn);
		const $menu = $(E("div")).addClass("ribbon-dropdown-menu").appendTo($btn).hide();
		
		$arrow.on("click", (e) => {
			e.stopPropagation();
			$(".ribbon-dropdown-menu").not($menu).hide();
			$menu.toggle();
		});

		options.forEach(opt => {
			if (opt.type === "divider") {
				$(E("div")).addClass("ribbon-dropdown-divider").appendTo($menu);
				return;
			}
			const $item = $(E("div")).addClass("ribbon-dropdown-item").appendTo($menu);
			if (opt.type === "checkbox") {
				const isChecked = opt.checked();
				const $check = $(E("span")).addClass("ribbon-dropdown-check").text(isChecked ? "✓" : "").appendTo($item);
				$(E("span")).text(opt.label).appendTo($item);
				$item.on("click", (e) => {
					e.stopPropagation();
					opt.action();
					const nowChecked = opt.checked();
					$check.text(nowChecked ? "✓" : "");
					if (!opt.keepOpen) $menu.hide();
				});
			} else {
				$item.text(opt.label).on("click", (e) => {
					e.stopPropagation();
					opt.action();
					$menu.hide();
				});
			}
		});

		$(document).on("click", () => $menu.hide());
		return $btn;
	}

	function is_tool_active(tool) {
		const selected = window.selected_tool;
		if (!selected) return false;
		if (selected === tool) return true;
		if (selected.id && tool.id && selected.id === tool.id) return true;
		return false;
	}

	function render_home_tab() {
		// Clipboard Group
		const $group_clipboard = create_group("Clipboard").appendTo($content_area);
		const $clip_content = $group_clipboard.find(".ribbon-group-content");
		create_ribbon_button("Paste", "icon-paste", () => edit_paste(), true).appendTo($clip_content);
		const $clip_small = $(E("div")).addClass("ribbon-column").appendTo($clip_content);
		create_ribbon_button("Cut", "icon-cut", () => edit_cut()).appendTo($clip_small);
		create_ribbon_button("Copy", "icon-copy", () => edit_copy()).appendTo($clip_small);

		// Image Group
		const $group_image = create_group("Image").appendTo($content_area);
		const $image_content = $group_image.find(".ribbon-group-content");
		
		const select_options = [
			{ label: "Rectangular selection", action: () => select_tool(tools.find(t => t.id === "TOOL_SELECT")) },
			{ label: "Free-form selection", action: () => select_tool(tools.find(t => t.id === "TOOL_FREE_FORM_SELECT")) },
			{ type: "divider" },
			{ label: "Select all", action: () => select_all() },
			{ label: "Invert selection", action: () => { 
                // Basic invert logic: if selection exists, it's hard to invert in jspaint without custom logic.
                // We'll trigger the menu action if possible.
                const menu_item = menus[Object.keys(menus)[1]].find(m => m && m.label && m.label.includes("Invert"));
                if (menu_item && menu_item.action) menu_item.action();
            } },
			{ label: "Delete", action: () => delete_selection() },
			{ type: "divider" },
			{ 
				label: "Transparent selection", 
				type: "checkbox", 
				checked: () => window.tool_transparent_mode, 
				action: () => { 
					window.tool_transparent_mode = !window.tool_transparent_mode;
					$(window).trigger("option-changed");
				},
				keepOpen: true
			}
		];
		create_ribbon_dropdown("Select", "icon-select", select_options).appendTo($image_content);

		const $img_small = $(E("div")).addClass("ribbon-column").appendTo($image_content);
		create_ribbon_button("Resize", "icon-resize", () => image_stretch_and_skew()).appendTo($img_small);
		create_ribbon_button("Rotate", "icon-rotate", () => image_flip_and_rotate()).appendTo($img_small);

		// Tools Group
		const $group_tools = create_group("Tools").appendTo($content_area);
		const $tools_content = $group_tools.find(".ribbon-group-content");
		const $tools_grid = $(E("div")).addClass("ribbon-grid-3x2").appendTo($tools_content);
		
		const tool_ids = ["TOOL_PENCIL", "TOOL_FILL", "TOOL_TEXT", "TOOL_ERASER", "TOOL_SELECT", "TOOL_MAGNIFIER"];
		tool_ids.forEach((id) => {
			const tool = tools.find(t => t.id === id);
			if (!tool) return;
			const active = is_tool_active(tool);
			const $tool_btn = $(E("div"))
				.addClass("ribbon-grid-btn")
				.toggleClass("active", active)
				.attr("title", tool.name)
				.appendTo($tools_grid)
				.on("click", () => {
					select_tool(tool);
					$(window).trigger("option-changed");
				});
			$(E("span")).addClass("tool-icon").css("--icon-index", tools.indexOf(tool)).appendTo($tool_btn);
		});

		// Brushes
		const brush_tool = tools.find(t => t.id === "TOOL_BRUSH");
		create_ribbon_button("Brushes", "tool-icon", () => select_tool(brush_tool), true)
			.toggleClass("active", is_tool_active(brush_tool))
			.appendTo($tools_content)
			.find(".ribbon-button-icon")
			.css({
				"background-position": `calc(${tools.indexOf(brush_tool)} * -16px) 0`,
				"transform": "scale(2)",
				"background-image": "url(images/classic/tools.png)"
			});

		// Shapes Group
		const $group_shapes = create_group("Shapes").appendTo($content_area);
		const $shapes_content = $group_shapes.find(".ribbon-group-content");
		const $shapes_grid = $(E("div")).addClass("ribbon-grid-3x2").appendTo($shapes_content);
		const shape_ids = ["TOOL_LINE", "TOOL_CURVE", "TOOL_RECTANGLE", "TOOL_POLYGON", "TOOL_ELLIPSE", "TOOL_ROUNDED_RECTANGLE"];
		tools.filter(t => shape_ids.includes(t.id)).forEach((tool) => {
			const active = is_tool_active(tool);
			const $tool_btn = $(E("div"))
				.addClass("ribbon-grid-btn")
				.toggleClass("active", active)
				.attr("title", tool.name)
				.appendTo($shapes_grid)
				.on("click", () => {
					select_tool(tool);
					$(window).trigger("option-changed");
				});
			$(E("span")).addClass("tool-icon").css("--icon-index", tools.indexOf(tool)).appendTo($tool_btn);
		});

		// Colors Group
		const $group_colors = create_group("Colors").appendTo($content_area);
		const $colors_content = $group_colors.find(".ribbon-group-content");
		const $color_container = $(E("div")).addClass("ribbon-colors-container").appendTo($colors_content);
		
		const fg_color = (window.selected_colors && window.selected_colors.foreground) || "black";
		const bg_color = (window.selected_colors && window.selected_colors.background) || "white";
		
		const $c1 = $(E("div")).addClass("color-indicator-block").appendTo($color_container);
		$(E("div")).addClass("ribbon-swatch-large").css("background-color", fg_color).appendTo($c1);
		$(E("div")).addClass("color-label").text("Color 1").appendTo($c1);

		const $c2 = $(E("div")).addClass("color-indicator-block").appendTo($color_container);
		$(E("div")).addClass("ribbon-swatch-large").css("background-color", bg_color).appendTo($c2);
		$(E("div")).addClass("color-label").text("Color 2").appendTo($c2);

		const $palette = $(E("div")).addClass("ribbon-palette").appendTo($color_container);
		const current_palette = window.palette || window.default_palette || [];
		current_palette.slice(0, 30).forEach((color) => {
			$(E("div"))
				.addClass("ribbon-swatch")
				.css("background-color", color)
				.appendTo($palette)
				.on("pointerdown", (e) => {
					// jspaint uses $(window) or $G for global events
					const $G = window.$G || $(window);
					const colors = window.selected_colors;
					
					if (!colors) {
						console.warn("Ribbon: window.selected_colors not found");
						return;
					}

					if (e.button === 0) {
						colors.foreground = color;
					} else if (e.button === 2) {
						colors.background = color;
					}
					
					$G.trigger("option-changed");
					
					// Force update for current tool
					if (window.update_fill_and_stroke_colors_and_lineWidth && window.selected_tool) {
						window.update_fill_and_stroke_colors_and_lineWidth(window.selected_tool);
					}
				});
		});
	}

	function render_view_tab() {
		const $group_zoom = create_group("Zoom").appendTo($content_area);
		const $zoom_content = $group_zoom.find(".ribbon-group-content");
		create_ribbon_button("Zoom In", "icon-zoom-in", () => window.set_magnification(window.magnification * 2), true).appendTo($zoom_content);
		create_ribbon_button("Zoom Out", "icon-zoom-out", () => window.set_magnification(window.magnification / 2), true).appendTo($zoom_content);
		create_ribbon_button("100%", "icon-zoom-100", () => window.set_magnification(1)).appendTo($zoom_content);

		const $group_show_hide = create_group("Show/hide").appendTo($content_area);
		const $show_hide_content = $group_show_hide.find(".ribbon-group-content");
		$show_hide_content.css({
			"display": "flex",
			"flex-direction": "column",
			"justify-content": "center",
			"padding": "0 5px",
			"gap": "2px"
		});

		const $classic_ui_item = $(E("div")).addClass("ribbon-checkbox-item").appendTo($show_hide_content);
		const $checkbox = $(E("input")).attr({ type: "checkbox", id: "show-classic-ui-checkbox" }).appendTo($classic_ui_item);
		if ($("body").hasClass("show-classic-ui")) {
			$checkbox.prop("checked", true);
		}
		$(E("label")).attr("for", "show-classic-ui-checkbox").text("Classic Sidebar").css({ "margin-left": "5px", "cursor": "default" }).appendTo($classic_ui_item);
		
		$checkbox.on("change", () => {
			$("body").toggleClass("show-classic-ui", $checkbox.prop("checked"));
			$(window).trigger("resize");
		});
	}

	function create_group(label) {
		const $group = $(E("div")).addClass("ribbon-group");
		$(E("div")).addClass("ribbon-group-content").appendTo($group);
		$(E("div")).addClass("ribbon-group-label").text(label).appendTo($group);
		return $group;
	}

	$file_button.on("click", (e) => {
		$(".menu-button").first().trigger("pointerdown");
	});

	$(window).on("option-changed tool-changed", () => {
		const activeTabId = tabs.find(t => $tab_buttons.find(b => b.id === t.id).$button.hasClass("active")).id;
		render_tab_content(activeTabId);
	});

	select_tab("home");

	const $c = /** @type {JQuery<HTMLDivElement> & I$Component & I$Ribbon} **/ ($Component(
		"Ribbon",
		"ribbon-component",
		"wide",
		$ribbon
	));

	return $c;
}
