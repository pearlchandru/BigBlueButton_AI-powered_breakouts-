from flask import Flask, request, jsonify
from flask_cors import CORS
from swarm import Swarm, Agent

app = Flask(__name__)
CORS(app, supports_credentials=True, resources={r"/receive": {"origins": "https://xyloite.online"}})


# Global variables for tracking
last_response = None
current_phase = "introduction"


def transfer_to_discussion(context):
    global current_phase
    current_phase = "discussion"
    return "⏹️ Introduction complete. Starting the discussion phase."


def transfer_to_conclusion(context):
    global current_phase
    current_phase = "conclusion"
    return "⏹️ Discussion complete. Moving to conclusion phase."


# Define Swarm Agents
Introduction = Agent(
    name="Introduction",
    instructions="""
    You are a facilitator for a group discussion. 
    Your job is to:
    1. Start by asking participants for their names and welcome them.
    2. Check if all participants have joined and given their names.
    3. If all have given their names, then ask for the discussion title and goals.
    4. Once all participants have introduced themselves and set the goals, transfer them to Discussion agent.
    Keep responses within 10 words.
    Transfer to Discussion agent only when all introductions and goals are set.
    """,
    functions=[transfer_to_discussion],
)

Discussion = Agent(
    name="Discussion",
        instructions="""
    You are a discussion manager AI.
    Your job is to Intervene within 10 words only when:
    1. A participant is not actively engaging in conversation.
    2. The discussion veers off-topic.
    3. Consensus needs to be reached between participants.
    4. You can connect relevant contributions to enrich the discussion.
    5. Providing examples or illustrations clarifies concepts or ideas.
    6. When participants indicate they want to conclude or wrap up, transfer to Conclusion Agent.
    If no intervention is needed, do not respond
    """,
    functions=[transfer_to_conclusion],
)

Conclusion = Agent(
    name="Conclusion",
    instructions="""
    You are a facilitator to conclude the group discussion. 
    Your job is to:
    1. Thank the participants.
    2. Conclude the discussion with a short summary.
    3. End the session appropriately.
    Keep responses brief .
    """
)


@app.route('/receive', methods=['POST'])
def receive_data():
    global last_response, current_phase

    payload = request.get_json() or request.form
    chat_data = payload.get('chatData', [])

    print("Headers:", dict(request.headers))
    print("\nPayload Received:", payload)

    try:
        current_message = chat_data[-1]['message'] if chat_data else ""

        if current_message == last_response:
            return jsonify({"status": "skipped", "message": "Repetitive message"}), 200

        # Create Swarm client
        client = Swarm()

        # Select appropriate agent based on current phase
        current_agent = {
            "introduction": Introduction,
            "discussion": Discussion,
            "conclusion": Conclusion
        }[current_phase]

        # Run the appropriate agent with chat history
        response = client.run(
            agent=current_agent,
            messages=[{"role": "user", "content": msg["message"]} for msg in chat_data]
        )

        # Check if the response requires intervention
        agent_response = response.messages[-1]['content']
        if agent_response in ["BOT - NO INTERVENTION NEEDED", None]:
            print("\nBot Response: No intervention needed.")
            return jsonify({"status": "success", "response": None}), 204  # HTTP 204 No Content

        last_response = f"🤖 BOT: {agent_response}"
        print("\nBot Response:", last_response)
        return jsonify({"status": "success", "response": last_response}), 200

    except Exception as e:
        print("Error:", e)
        return jsonify({"status": "error", "message": str(e)}), 500


if __name__ == '__main__':
    ssl_cert = '/etc/letsencrypt/live/xyloite.online/fullchain.pem'
    ssl_key = '/etc/letsencrypt/live/xyloite.online/privkey.pem'
    app.run(debug=True, host='143.110.219.97', port=5000, ssl_context=(ssl_cert, ssl_key))