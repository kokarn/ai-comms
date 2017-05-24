import io.socket.client.IO;
import io.socket.client.Socket;
import io.socket.emitter.Emitter;
import org.json.JSONException;
import org.json.JSONObject;

import java.net.URISyntaxException;

public class RockPaperScissors {
    static int wins = 0;
    static int losses = 0;
    static int draws = 0;

    public static void main(String[] args) throws Exception {
        final JSONObject startGameJson = new JSONObject();
        startGameJson.put("type", "RockPaperScissors");

        final int maxCount = 1000;
        final int[] iter = {0};

        final Socket socket = IO.socket("http://192.168.205.117:3000");
        socket.on(Socket.EVENT_CONNECT, new Emitter.Listener() {

            public void call(Object... args) {
                socket.emit("join-game", startGameJson);
            }

        }).on("send-move", new Emitter.Listener() {

            public void call(Object... args) {
                String move = SendMove();
                socket.emit("move", move);
            }

        }).on("game-ended", new Emitter.Listener() {

            public void call(Object... args) {
                JSONObject payload = (JSONObject)args[0];
                try {
                    RecordGameEnded(payload);
                } catch (Exception e) {
                    e.printStackTrace();
                }

                if(iter[0] < maxCount){
                    iter[0]++;
                    socket.emit("join-game", startGameJson);
                } else {
                    socket.disconnect();
                }
            }

        }).on(Socket.EVENT_DISCONNECT, new Emitter.Listener() {

            public void call(Object... args) {
                socket.disconnect();
                System.out.println("Wins: "+ wins+ ", Losses: "+ losses+ ", Draws: "+ draws);
            }

        });
        socket.connect();
    }

    private static void RecordGameEnded(JSONObject payload) throws Exception {
        String result = (String)payload.get("result");
        if(result.equals("win")){
            wins++;
        } else if(result.equals("loss")){
            losses++;
        } else if(result.equals("draw")) {
            draws++;
        } else {
            throw new Exception(result);
        }
    }

    private static String SendMove(){
        return "paper";
    }
}
