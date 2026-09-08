const widgetType = pp_helpdesk.pp_helpdesk_type
const styles = pp_helpdesk.pp_helpdesk
const zendeskKey = pp_helpdesk.pp_helpdesk_key
const isZendeskOffset = pp_helpdesk.pp_is_sticky_footer;

if (widgetType === 'zendesk') {
	setTimeout(function () {
		const script = document.createElement('script')
		script.id = 'ze-snippet'
		script.async = true
		script.src = `https://static.zdassets.com/ekr/snippet.js?key=${zendeskKey}`
		document.getElementsByTagName('head')[0].appendChild(script)
	}, 5000)
}

window.zESettings = {
	webWidget: {
		contentOnPageLoad: false,
		offset: {
			horizontal: '0px',
			vertical: isZendeskOffset == 1 ? '80px' : '0',
			mobile: {
				vertical: isZendeskOffset == 1 ? '80px' : '0',
				horizontal: '0px',
			},
		},
		title: {
			'*': 'hello',
		},

		launcher: {
			label: {
				'*': styles.tr_helpdesk_text_label,
			},
		},
		color: {
			launcher: styles.helpdesk_icon_background_color
				? styles.helpdesk_icon_background_color
				: '#0ED13D',
			launcherText: styles.helpdesk_text_color
				? styles.helpdesk_text_color
				: '#fff',
			button: styles.helpdesk_widget_button_color,
			header: styles.helpdesk_widget_header_color,
			theme: styles.helpdesk_widget_theme_color,
		},
	},
}

if (widgetType === 'zendesk') {
	document.querySelector('#liveChat').addEventListener('click', function (e) {
		e.preventDefault()
		zE('webWidget', 'open')
	})
}
