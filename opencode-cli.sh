#!/bin/bash

# OpenCode CLI - Llama.cpp Integration via Docker
# Usage: ./opencode-cli.sh "Your prompt here"

set -e

# Configuration
LLAMA_HOST="${LLAMA_HOST:-http://llama-cpp-tinyllama:8000}"
LLAMA_PORT="${LLAMA_PORT:-8000}"
MODEL_NAME="${MODEL_NAME:-tinyllama}"

print_usage() {
    cat << EOF
OpenCode CLI - Llama.cpp Server Interface

Usage: opencode-cli <command> [options]

Commands:
    prompt <text>       Send a prompt to Llama
    chat               Start interactive chat mode
    health             Check Llama server health
    help               Show this help message

Examples:
    opencode-cli prompt "What is Docker?"
    opencode-cli chat
    opencode-cli health

Model: TinyLlama 1.1B Chat (GGUF Q4_K_M)
Endpoint: ${LLAMA_HOST}
EOF
}

check_health() {
    echo "Checking Llama server at ${LLAMA_HOST}..."
    if curl -s "${LLAMA_HOST}/health" > /dev/null 2>&1; then
        echo "✓ Llama server is running"
        return 0
    else
        echo "✗ Llama server is not responding"
        return 1
    fi
}

send_prompt() {
    local prompt="$1"
    
    echo "Sending prompt to Llama..."
    echo "---"
    
    curl -s -X POST "${LLAMA_HOST}/completion" \
        -H "Content-Type: application/json" \
        -d "{
            \"prompt\": \"$prompt\",
            \"n_predict\": 256,
            \"temperature\": 0.7,
            \"top_p\": 0.9
        }" | grep -o '"content":"[^"]*' | cut -d'"' -f4
    
    echo ""
    echo "---"
}

chat_mode() {
    echo "Starting interactive chat mode (type 'exit' to quit)"
    echo "Connected to: ${LLAMA_HOST}"
    echo ""
    
    while true; do
        read -p "You: " user_input
        
        if [ "$user_input" = "exit" ] || [ "$user_input" = "quit" ]; then
            echo "Goodbye!"
            break
        fi
        
        if [ -z "$user_input" ]; then
            continue
        fi
        
        echo -n "Llama: "
        send_prompt "$user_input" | head -n 1
        echo ""
    done
}

main() {
    local command="${1:-help}"
    
    case "$command" in
        prompt)
            if [ -z "$2" ]; then
                echo "Error: prompt requires text argument"
                echo "Usage: opencode-cli prompt \"your text here\""
                exit 1
            fi
            send_prompt "$2"
            ;;
        chat)
            chat_mode
            ;;
        health)
            check_health
            ;;
        help|--help|-h)
            print_usage
            ;;
        *)
            echo "Unknown command: $command"
            print_usage
            exit 1
            ;;
    esac
}

main "$@"
