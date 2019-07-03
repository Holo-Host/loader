import HoloResolver from './modules/resolver';

/**
 * hLoader is a self-initiating script that downloads hApp's UI from HoloPorts on Holo network
 *
 * Public API exposes: initHapp()
 * TODO: In the future if the process of connecting to the host takes time (like more than 500ms)
 *       display nice Holo logo and something like "Connecting to Holo network..."
 *
 */

window.hLoader = (function(){

    /**
     * Init hApp by taking url and grabing content from resolved HoloPort address
     * TODO: Loader should look for a _UI_tranche in localStorage(). If not found it should download _UI_tranche
     *       from resolver.holohost.net and save it in the localStorge() for later use.
     *       We will also want to have some mechanism of detecting failed calls to hosts,
     *       making call to another host from the list and reporting slacker
     *       to the tranche service
     * @return null
     */
    const initHapp = () => {
        // Grab url of hApp
        const resolver = new HoloResolver (window.location);

        resolver.getIframeAddress()
            .then(replaceHtml);
    }

    /**
     * This function is actually removing all the content of the body and creating iFrame
     * where entire UI of a hApp is loaded from HoloPort.
     * This gives us consistent behaviour of the UI (no hacks)
     * while leaving url in browser intact
     * @return null
     */
    const replaceHtml = (address) => {
        if (!address) {
            return;
        }

        // create iFrame
        let frame = document.createElement('iframe');
        frame.setAttribute('id', 'main');
        frame.setAttribute('src', address);
        frame.setAttribute('style', 'position:fixed; top:0; left:0; bottom:0; right:0; width:100%; height:100%; border:none; margin:0; padding:0; overflow:hidden; z-index:999999;')

        // replace body with created iFrame
        document.getElementById('old_main').replaceWith(frame);

        // TODO: establish inter-frame communication with Window​.post​Message()
        // to listen to title updates (window.document.title),
        // url updates (https://stackoverflow.com/a/3354511/1182050),
        // etc.
    }

    // Public API
    return {
        initHapp,
    }

})();

hLoader.initHapp();