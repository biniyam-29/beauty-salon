<?php
namespace src\modules;

/**
 * Defines the contract for all controller classes.
 * Ensures that every controller has a handleRequest method.
 */
interface ControllerInterface {
    /**
     * Handles an incoming web request.
     *
     * @param array $paths The parts of the URL path.
     * @param string $method The HTTP request method (e.g., 'GET', 'POST').
     * @param string|null $body The raw request body.
     * @return string A JSON encoded string response.
     */
    public function handleRequest(array $paths, string $method, ?string $body);
}
?>
